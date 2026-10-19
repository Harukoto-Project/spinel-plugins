import { useLayoutEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STICK_THRESHOLD_PX = 32;

type LogViewerProps = {
  logs: string[];
};

export function LogViewer({ logs }: LogViewerProps) {
  const containerRef = useRef<HTMLPreElement | null>(null);
  const stickToBottom = useRef(true);

  const handleScroll = () => {
    const element = containerRef.current;
    if (element === null) return;
    stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < STICK_THRESHOLD_PX;
  };

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (element !== null && stickToBottom.current) element.scrollTop = element.scrollHeight;
  }, [logs]);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>ログ</CardTitle>
      </CardHeader>
      <CardContent>
        <pre
          ref={containerRef}
          onScroll={handleScroll}
          className="h-[60vh] min-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs leading-relaxed"
        >
          {logs.length > 0 ? logs.join('\n') : 'ログはまだありません'}
        </pre>
      </CardContent>
    </Card>
  );
}
