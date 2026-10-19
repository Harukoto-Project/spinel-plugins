import { useState } from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { RunRequest, ZenTask } from '../../shared/types.js';
import { ALL_MONTHS, MonthSelect } from './MonthSelect.js';
import { OptionSwitch } from './OptionSwitch.js';
import { TaskSelect } from './TaskSelect.js';

type RunFormProps = {
  running: boolean;
  busy: boolean;
  configured: boolean;
  onRun: (request: RunRequest) => void;
  onStop: () => void;
};

export function RunForm({ running, busy, configured, onRun, onStop }: RunFormProps) {
  const [task, setTask] = useState<ZenTask>('reports');
  const [dryRun, setDryRun] = useState(false);
  const [headless, setHeadless] = useState(false);
  const [month, setMonth] = useState(ALL_MONTHS);
  const [force, setForce] = useState(false);
  const [manualGoogle, setManualGoogle] = useState(false);

  const locked = running || busy;

  const handleRun = () => {
    if (task === 'login') {
      onRun({ task, headless, force, manualGoogle });
      return;
    }
    onRun({ task, dryRun, headless, month: month === ALL_MONTHS ? null : Number(month) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>実行</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <TaskSelect value={task} disabled={locked} onValueChange={setTask} />

        {task === 'reports' ? (
          <>
            <MonthSelect value={month} disabled={locked} onValueChange={setMonth} />
            <OptionSwitch
              id="zen-dry-run"
              label="ドライラン"
              description="対象の月・教科を表示するだけで、動画は再生しません"
              checked={dryRun}
              disabled={locked}
              onCheckedChange={setDryRun}
            />
          </>
        ) : (
          <>
            <OptionSwitch
              id="zen-force"
              label="再ログイン"
              description="保存済みのセッションがあっても、もう一度ログインします"
              checked={force}
              disabled={locked}
              onCheckedChange={setForce}
            />
            <OptionSwitch
              id="zen-manual-google"
              label="Google に手動でログイン"
              description="メールとパスワードを自動入力せず、ノードのブラウザで手動でログインします"
              checked={manualGoogle}
              disabled={locked}
              onCheckedChange={setManualGoogle}
            />
          </>
        )}

        <OptionSwitch
          id="zen-headless"
          label="ヘッドレス"
          description="ブラウザを表示せずに実行します。動画視聴や初回ログインには向きません"
          checked={headless}
          disabled={locked}
          onCheckedChange={setHeadless}
        />
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button onClick={handleRun} disabled={locked || !configured}>
          <Play />
          実行
        </Button>
        <Button variant="destructive" onClick={onStop} disabled={!running || busy}>
          <Square />
          停止
        </Button>
      </CardFooter>
    </Card>
  );
}
