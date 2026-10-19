import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ZenTask } from '../../shared/types.js';
import { TASK_LABELS } from '../format.js';

const TASKS: ZenTask[] = ['reports', 'login'];

type TaskSelectProps = {
  value: ZenTask;
  disabled?: boolean;
  onValueChange: (value: ZenTask) => void;
};

export function TaskSelect({ value, disabled, onValueChange }: TaskSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="zen-task">処理</Label>
      <Select value={value} onValueChange={(next: string) => onValueChange(next as ZenTask)} disabled={disabled}>
        <SelectTrigger id="zen-task" className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TASKS.map((task) => (
            <SelectItem key={task} value={task}>
              {TASK_LABELS[task]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
