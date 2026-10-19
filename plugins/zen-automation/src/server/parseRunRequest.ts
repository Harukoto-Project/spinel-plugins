import type { RunRequest, ZenTask } from '../shared/types.js';
import { RunnerError } from './RunnerError.js';

const TASKS: readonly ZenTask[] = ['reports', 'login'];

const invalid = (message: string): never => {
  throw new RunnerError(400, 'invalid_request', message);
};

const readFlag = (body: Record<string, unknown>, key: string): boolean => {
  const value = body[key];
  if (value === undefined || value === null) return false;
  if (typeof value !== 'boolean') return invalid(`${key} は true / false で指定してください`);
  return value;
};

const readMonth = (body: Record<string, unknown>): number | null => {
  const value = body['month'];
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 12) {
    return invalid('month は 1〜12 の整数で指定してください');
  }
  return value;
};

export const parseRunRequest = (input: unknown): RunRequest => {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return invalid('リクエストボディは JSON オブジェクトで指定してください');
  }
  const body = input as Record<string, unknown>;
  const task = body['task'];
  if (typeof task !== 'string' || !TASKS.includes(task as ZenTask)) {
    return invalid(`task は ${TASKS.join(' / ')} のどちらかで指定してください`);
  }

  if (task === 'login') {
    return {
      task,
      headless: readFlag(body, 'headless'),
      force: readFlag(body, 'force'),
      manualGoogle: readFlag(body, 'manualGoogle'),
    };
  }

  return {
    task: 'reports',
    dryRun: readFlag(body, 'dryRun'),
    headless: readFlag(body, 'headless'),
    month: readMonth(body),
  };
};

export const buildScriptArgs = (request: RunRequest): string[] => {
  const args: string[] = [];
  if (request.task === 'login') {
    if (request.force) args.push('--force');
    if (request.headless) args.push('--headless');
    if (request.manualGoogle) args.push('--manual-google');
    return args;
  }
  if (request.dryRun) args.push('--dry-run');
  if (request.headless) args.push('--headless');
  if (request.month !== null && request.month !== undefined) args.push('--month', String(request.month));
  return args;
};
