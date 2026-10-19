import type { ManagedProcess, PluginContext } from '@spinel/server';
import type { RunRecord, RunRequest, ZenStatus } from '../shared/types.js';
import { RunnerError } from './RunnerError.js';
import { buildScriptArgs } from './parseRunRequest.js';
import { assertScriptExists, describeConfigError, resolveRunnerConfig } from './runnerConfig.js';

const LOG_LIMIT = 300;
const STORAGE_KEY = 'lastRun';

type SavedRun = {
  run: RunRecord;
  logs: string[];
};

export class ZenRunner {
  private process: ManagedProcess | null = null;
  private run: RunRecord | null = null;
  private savedLogs: string[] = [];
  private starting = false;
  private stopRequested = false;

  constructor(private readonly ctx: PluginContext) {}

  async restore(): Promise<void> {
    const saved = await this.ctx.storage.get<SavedRun>(STORAGE_KEY);
    if (saved === null || typeof saved !== 'object' || saved.run === undefined) return;
    this.run = saved.run;
    this.savedLogs = Array.isArray(saved.logs) ? saved.logs : [];
  }

  private get running(): boolean {
    return this.starting || (this.process?.running ?? false);
  }

  async getStatus(): Promise<ZenStatus> {
    const configError = await describeConfigError(this.ctx);
    return {
      configured: configError === null,
      configError,
      running: this.running,
      run: this.run,
      logs: this.process ? this.process.logs(LOG_LIMIT) : this.savedLogs,
    };
  }

  async start(request: RunRequest): Promise<void> {
    if (this.running) {
      throw new RunnerError(409, 'already_running', '別の処理が実行中です。終了するか停止してから実行してください');
    }

    this.starting = true;
    try {
      const config = await resolveRunnerConfig(this.ctx);
      const script = await assertScriptExists(config, request.task);
      const args = buildScriptArgs(request);

      let child: ManagedProcess;
      try {
        child = await this.ctx.process.spawn(config.pythonPath, [script, ...args], { cwd: config.projectPath });
      } catch (error) {
        this.ctx.logger.error('プロセスを起動できませんでした', error);
        const reason = error instanceof Error ? error.message : String(error);
        throw new RunnerError(500, 'spawn_failed', `プロセスを起動できませんでした: ${reason}`);
      }

      const run: RunRecord = {
        task: request.task,
        args: [script, ...args],
        startedAt: child.startedAt,
        finishedAt: null,
        exitCode: null,
        signal: null,
        stopped: false,
      };
      this.process = child;
      this.run = run;
      this.stopRequested = false;
      this.savedLogs = [];
      child.onExit((exit) => void this.handleExit(child, run, exit.code, exit.signal));
    } finally {
      this.starting = false;
    }
  }

  async stop(): Promise<void> {
    const child = this.process;
    if (child === null || !child.running) {
      throw new RunnerError(409, 'not_running', '実行中の処理はありません');
    }
    this.stopRequested = true;
    await child.stop();
  }

  private async handleExit(
    child: ManagedProcess,
    run: RunRecord,
    exitCode: number | null,
    signal: string | null,
  ): Promise<void> {
    if (this.process !== child) return;

    const finished: RunRecord = {
      ...run,
      finishedAt: Date.now(),
      exitCode,
      signal,
      stopped: this.stopRequested,
    };
    this.run = finished;
    const logs = child.logs(LOG_LIMIT);
    this.savedLogs = logs;

    try {
      await this.ctx.storage.set(STORAGE_KEY, { run: finished, logs } satisfies SavedRun);
    } catch (error) {
      this.ctx.logger.error('実行結果を保存できませんでした', error);
    }
  }
}
