import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { PluginContext } from '@spinel/server';
import type { ZenTask } from '../shared/types.js';
import { RunnerError } from './RunnerError.js';

export type RunnerConfig = {
  projectPath: string;
  pythonPath: string;
};

export const TASK_SCRIPTS: Record<ZenTask, string> = {
  reports: 'run_reports.py',
  login: 'run_login.py',
};

const isFile = async (path: string): Promise<boolean> => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

const isDirectory = async (path: string): Promise<boolean> => {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
};

const readText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const defaultPython = (projectPath: string): string =>
  process.platform === 'win32'
    ? join(projectPath, '.venv', 'Scripts', 'python.exe')
    : join(projectPath, '.venv', 'bin', 'python');

export const resolveRunnerConfig = async (ctx: PluginContext): Promise<RunnerConfig> => {
  const settings = await ctx.settings.get();
  const projectPath = readText(settings['projectPath']);
  if (projectPath === '') {
    throw new RunnerError(400, 'not_configured', 'ZenStudy-Automation のパスが設定されていません');
  }
  if (!(await isDirectory(projectPath))) {
    throw new RunnerError(400, 'project_not_found', `ZenStudy-Automation のディレクトリが見つかりません: ${projectPath}`);
  }

  const pythonPath = readText(settings['pythonPath']) || defaultPython(projectPath);
  if (!(await isFile(pythonPath))) {
    throw new RunnerError(400, 'python_not_found', `Python の実行ファイルが見つかりません: ${pythonPath}`);
  }

  return { projectPath, pythonPath };
};

export const assertScriptExists = async (config: RunnerConfig, task: ZenTask): Promise<string> => {
  const script = TASK_SCRIPTS[task];
  if (!(await isFile(join(config.projectPath, script)))) {
    throw new RunnerError(400, 'script_not_found', `${script} が見つかりません: ${config.projectPath}`);
  }
  return script;
};

export const describeConfigError = async (ctx: PluginContext): Promise<string | null> => {
  try {
    await resolveRunnerConfig(ctx);
    return null;
  } catch (error) {
    if (error instanceof RunnerError) return error.message;
    throw error;
  }
};
