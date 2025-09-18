'use client';

import { Terminal, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCommandLog } from '@/hooks/use-command-log';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function CommandLogger() {
  const { log, clearLog, isInitialized } = useCommandLog();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="grid gap-1">
                <CardTitle className="flex items-center">
                    <Terminal className="mr-2" />
                    Command Log
                </CardTitle>
                <CardDescription>Tracks operations and syncs.</CardDescription>
            </div>
          <Button variant="ghost" size="icon" onClick={clearLog} aria-label="Clear log">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4 -mr-4">
            <div className="space-y-4">
                {!isInitialized ? (
                    <>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </>
                ) : log.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        No commands logged yet.
                    </div>
                ) : (
                    log.map((entry) => (
                        <div key={entry.id} className="text-sm">
                            <div className="flex justify-between items-start">
                                <p className="font-mono text-xs break-words max-w-[80%]">{entry.message}</p>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
