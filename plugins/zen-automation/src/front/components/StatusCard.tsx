import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ZenStatus } from '../../shared/types.js';
import { TASK_LABELS, formatDateTime, formatDuration, getRunOutcome } from '../format.js';
import { RunStatusBadge } from './RunStatusBadge.js';

type StatusCardProps = {
  status: ZenStatus;
};

type DetailProps = {
  label: string;
  children: string;
};

function Detail({ label, children }: DetailProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all">{children}</dd>
    </div>
  );
}

export function StatusCard({ status }: StatusCardProps) {
  const { run } = status;
  const outcome = run ? getRunOutcome(run) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span>状態</span>
          <RunStatusBadge outcome={outcome} />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {status.configError && (
          <p role="alert" className="break-words text-destructive">
            {status.configError}。プラグインの設定を確認してください。
          </p>
        )}
        {run ? (
          <dl className="flex flex-col gap-2">
            <Detail label="処理">{TASK_LABELS[run.task]}</Detail>
            <Detail label="コマンド">{run.args.join(' ')}</Detail>
            <Detail label="開始">{formatDateTime(run.startedAt)}</Detail>
            {run.finishedAt !== null && (
              <>
                <Detail label="終了">{formatDateTime(run.finishedAt)}</Detail>
                <Detail label="所要時間">{formatDuration(run.startedAt, run.finishedAt)}</Detail>
                {!run.stopped && <Detail label="終了コード">{String(run.exitCode ?? run.signal ?? '-')}</Detail>}
              </>
            )}
          </dl>
        ) : (
          <p className="text-muted-foreground">まだ実行されていません</p>
        )}
      </CardContent>
    </Card>
  );
}
