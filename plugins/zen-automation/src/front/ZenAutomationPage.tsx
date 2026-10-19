import type { HostApi } from '@spinel/front';
import { LogViewer } from './components/LogViewer.js';
import { RunForm } from './components/RunForm.js';
import { StatusCard } from './components/StatusCard.js';
import { ZenSkeleton } from './components/ZenSkeleton.js';
import { useZenStatus } from './useZenStatus.js';

type ZenAutomationPageProps = {
  host: HostApi;
};

type ErrorMessageProps = {
  message: string;
};

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p role="alert" className="break-words text-sm text-destructive">
      {message}
    </p>
  );
}

export function ZenAutomationPage({ host }: ZenAutomationPageProps) {
  const { status, pollError, actionError, busy, run, stop } = useZenStatus(host);

  if (status === null) {
    return pollError ? <ErrorMessage message={`状態を取得できませんでした: ${pollError}`} /> : <ZenSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      {pollError && <ErrorMessage message={`状態を更新できませんでした: ${pollError}`} />}
      {actionError && <ErrorMessage message={actionError} />}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <StatusCard status={status} />
          <RunForm
            running={status.running}
            busy={busy}
            configured={status.configured}
            onRun={(request) => void run(request)}
            onStop={() => void stop()}
          />
        </div>
        <LogViewer logs={status.logs} />
      </div>
    </div>
  );
}
