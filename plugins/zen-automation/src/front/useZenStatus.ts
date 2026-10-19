import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HostApi } from '@spinel/front';
import type { RunRequest, ZenStatus } from '../shared/types.js';
import { createZenApi } from './api.js';

const POLL_INTERVAL_MS = 2000;

const describeError = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export function useZenStatus(host: HostApi) {
  const api = useMemo(() => createZenApi(host), [host]);
  const [status, setStatus] = useState<ZenStatus | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        const next = await api.getStatus();
        if (!cancelled) {
          setStatus(next);
          setPollError(null);
        }
      } catch (caught) {
        if (!cancelled) setPollError(describeError(caught));
      }
      if (!cancelled) timer = setTimeout(() => void tick(), POLL_INTERVAL_MS);
    };

    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [api]);

  const perform = useCallback(async (action: () => Promise<ZenStatus>) => {
    setBusy(true);
    setActionError(null);
    try {
      setStatus(await action());
    } catch (caught) {
      setActionError(describeError(caught));
    } finally {
      setBusy(false);
    }
  }, []);

  const run = useCallback((request: RunRequest) => perform(() => api.run(request)), [api, perform]);
  const stop = useCallback(() => perform(() => api.stop()), [api, perform]);

  return { status, pollError, actionError, busy, run, stop };
}
