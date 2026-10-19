import type { HostApi } from '@spinel/front';
import type { RunRequest, ZenStatus } from '../shared/types.js';

export type ZenApi = {
  getStatus: () => Promise<ZenStatus>;
  run: (request: RunRequest) => Promise<ZenStatus>;
  stop: () => Promise<ZenStatus>;
};

export const createZenApi = (host: HostApi): ZenApi => ({
  getStatus: () => host.api.request<ZenStatus>('/status'),
  run: (request) => host.api.request<ZenStatus>('/run', { method: 'POST', body: request }),
  stop: () => host.api.request<ZenStatus>('/stop', { method: 'POST', body: {} }),
});
