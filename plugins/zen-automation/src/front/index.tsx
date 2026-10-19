import type { HostApi } from '@spinel/front';
import { ZenAutomationPage } from './ZenAutomationPage.js';

export default function activate(host: HostApi): void {
  host.registerPage({
    id: 'main',
    label: 'ZEN Study',
    icon: 'Bot',
    component: () => <ZenAutomationPage host={host} />,
  });
}
