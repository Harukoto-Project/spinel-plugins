import type { RunRecord, ZenTask } from '../shared/types.js';

export const TASK_LABELS: Record<ZenTask, string> = {
  reports: 'レポート視聴',
  login: 'ログイン',
};

export const formatDateTime = (epochMs: number): string => new Date(epochMs).toLocaleString('ja-JP');

export const formatDuration = (fromMs: number, toMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor((toMs - fromMs) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}時間${minutes}分`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
};

export type RunOutcome = 'running' | 'completed' | 'failed' | 'stopped';

export const getRunOutcome = (run: RunRecord): RunOutcome => {
  if (run.finishedAt === null) return 'running';
  if (run.stopped) return 'stopped';
  return run.exitCode === 0 ? 'completed' : 'failed';
};
