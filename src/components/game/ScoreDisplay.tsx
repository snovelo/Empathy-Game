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
        <span className="font-medium text-slate-300">{label}</span>
        <span className="font-bold tabular-nums text-white">
          {score} / {max}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
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
  ownershipScore: number;
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
  ownershipScore,
  totalScore,
  finalScore,
  isBonus,
  feedback,
  improvementTip,
  manualOverride,
}: ScoreDisplayProps) {
  const maxTotal = isBonus ? 30 : 15;
  const totalColorScore = Math.round((finalScore / maxTotal) * 10);

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Score numbers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center bg-slate-800 rounded-xl p-3 border border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">G — Empathy</p>
          <p className={cn('text-3xl font-bold', scoreColor(empathyScore * 2))}>
            {empathyScore}
            <span className="text-sm font-normal text-slate-600">/5</span>
          </p>
        </div>
        <div className="text-center bg-slate-800 rounded-xl p-3 border border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">L — Tone</p>
          <p className={cn('text-3xl font-bold', scoreColor(toneScore * 2))}>
            {toneScore}
            <span className="text-sm font-normal text-slate-600">/5</span>
          </p>
        </div>
        <div className="text-center bg-slate-800 rounded-xl p-3 border border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">O+D — Ownership</p>
          <p className={cn('text-3xl font-bold', scoreColor(ownershipScore * 2))}>
            {ownershipScore}
            <span className="text-sm font-normal text-slate-600">/5</span>
          </p>
        </div>
        <div
          className={cn(
            'text-center rounded-xl p-3 border-2',
            isBonus
              ? 'bg-brand-950/40 border-brand-500/60 shadow-[0_0_16px_rgba(245,158,11,0.2)]'
              : 'bg-brand-950/30 border-brand-600/40',
          )}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            {isBonus ? 'Final ×2' : 'Total'}
          </p>
          <p className={cn('text-3xl font-bold', scoreColor(totalColorScore))}>
            {finalScore}
            <span className="text-sm font-normal text-slate-600">/{maxTotal}</span>
          </p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        <ScoreBar label="G — Go Beyond the Ask" score={empathyScore} color="bg-violet-500" />
        <ScoreBar label="L — Lead with Care" score={toneScore} color="bg-blue-500" />
        <ScoreBar label="O+D — Own & Do It Together" score={ownershipScore} color="bg-brand-500" />
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            GOLD Feedback
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{feedback}</p>
        </div>
      )}

      {/* Improvement tip */}
      {improvementTip && (
        <div className="bg-brand-950/40 rounded-xl p-4 border border-brand-700/40">
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-1.5">
            💡 GOLD Tip
          </p>
          <p className="text-sm text-brand-200 leading-relaxed">{improvementTip}</p>
        </div>
      )}

      {manualOverride && (
        <p className="text-xs text-brand-400 text-center">
          ✏️ This score was manually adjusted by the facilitator.
        </p>
      )}
    </div>
  );
}
