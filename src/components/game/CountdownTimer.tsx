'use client';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  startedAt: string;
  durationSeconds: number;
  onExpire?: () => void;
}

export function CountdownTimer({ startedAt, durationSeconds, onExpire }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
    return Math.max(0, Math.ceil(durationSeconds - elapsed));
  });

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
      const remaining = Math.max(0, Math.ceil(durationSeconds - elapsed));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [startedAt, durationSeconds, onExpire, secondsLeft]);

  const pct = (secondsLeft / durationSeconds) * 100;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const isUrgent = secondsLeft <= 30;
  const isWarning = secondsLeft <= 60;

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl px-4 py-2.5 border',
      isUrgent ? 'bg-red-50 border-red-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200',
    )}>
      <div
        className={cn(
          'text-2xl font-bold tabular-nums',
          isUrgent ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-700',
        )}
        aria-live="polite"
        aria-label={`${mins} minutes and ${secs} seconds remaining`}
      >
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </div>
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000',
            isUrgent ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-brand-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
