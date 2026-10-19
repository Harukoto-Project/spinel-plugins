import { Badge } from '@/components/ui/badge';
import type { RunOutcome } from '../format.js';

type RunStatusBadgeProps = {
  outcome: RunOutcome | null;
};

export function RunStatusBadge({ outcome }: RunStatusBadgeProps) {
  switch (outcome) {
    case 'running':
      return <Badge>実行中</Badge>;
    case 'completed':
      return <Badge variant="secondary">完了</Badge>;
    case 'failed':
      return <Badge variant="destructive">失敗</Badge>;
    case 'stopped':
      return <Badge variant="outline">停止済み</Badge>;
    default:
      return <Badge variant="outline">未実行</Badge>;
  }
}
