export type ZenTask = 'reports' | 'login';

export type RunRequest = {
  task: ZenTask;
  dryRun?: boolean;
  headless?: boolean;
  month?: number | null;
  force?: boolean;
  manualGoogle?: boolean;
};

export type RunRecord = {
  task: ZenTask;
  args: string[];
  startedAt: number;
  finishedAt: number | null;
  exitCode: number | null;
  signal: string | null;
  stopped: boolean;
};

export type ZenStatus = {
  configured: boolean;
  configError: string | null;
  running: boolean;
  run: RunRecord | null;
  logs: string[];
};
