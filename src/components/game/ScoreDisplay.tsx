'use client';
import { cn, scoreColor } from '@/lib/utils';

interface ScoreBarProps {
  label: string;
  score: number;
  max?: number;
  color?: string;
}

function ScoreBar({ label, score, max = 5, color = 'bg-brand-500' }: ScoreBarProps) {
  const pct = (score / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold tabular-nums text-slate-900">
          {score} / {max}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full animate-bar-fill', color)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${score} out of ${max}`}
        />
      </div>
    </div>
  );
}

interface ScoreDisplayProps {
  empathyScore: number;
  toneScore: number;
  totalScore: number;
  finalScore: number;
  isBonus: boolean;
  feedback?: string;
  improvementTip?: string;
  manualOverride?: boolean;
}

export function ScoreDisplay({
  empathyScore,
  toneScore,
  totalScore,
  finalScore,
  isBonus,
  feedback,
  improvementTip,
  manualOverride,
}: ScoreDisplayProps) {
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Score numbers */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-center bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Empathy</p>
          <p className={cn('text-3xl font-bold', scoreColor(empathyScore * 2))}>
            {empathyScore}
            <span className="text-sm font-normal text-slate-400">/5</span>
          </p>
        </div>
        <div className="flex-1 text-center bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Tone</p>
          <p className={cn('text-3xl font-bold', scoreColor(toneScore * 2))}>
            {toneScore}
            <span className="text-sm font-normal text-slate-400">/5</span>
          </p>
        </div>
        <div
          className={cn(
            'flex-1 text-center rounded-xl p-4 border-2',
            isBonus
              ? 'bg-amber-50 border-amber-300'
              : 'bg-brand-50 border-brand-200',
          )}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            {isBonus ? 'Final ×2' : 'Total'}
          </p>
          <p className={cn('text-3xl font-bold', scoreColor(finalScore))}>
            {finalScore}
            <span className="text-sm font-normal text-slate-400">/{isBonus ? 20 : 10}</span>
          </p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        <ScoreBar label="Empathy" score={empathyScore} color="bg-violet-500" />
        <ScoreBar label="Tone" score={toneScore} color="bg-blue-500" />
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Feedback
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{feedback}</p>
        </div>
      )}

      {/* Improvement tip */}
      {improvementTip && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1.5">
            💡 How to improve
          </p>
          <p className="text-sm text-blue-800 leading-relaxed">{improvementTip}</p>
        </div>
      )}

      {manualOverride && (
        <p className="text-xs text-amber-600 text-center">
          ✏️ This score was manually adjusted by the facilitator.
        </p>
      )}
    </div>
  );
}
