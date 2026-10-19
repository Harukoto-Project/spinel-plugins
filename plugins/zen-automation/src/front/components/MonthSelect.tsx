import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ALL_MONTHS = 'all';

const MONTHS = Array.from({ length: 12 }, (_, index) => String(index + 1));

type MonthSelectProps = {
  value: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
};

export function MonthSelect({ value, disabled, onValueChange }: MonthSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="zen-month">対象の月</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id="zen-month" className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_MONTHS}>指定なし(すべて)</SelectItem>
          {MONTHS.map((month) => (
            <SelectItem key={month} value={month}>
              {month}月
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
