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
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold tabular-nums text-gray-900">
          {score} / {max}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
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
        <div className="text-center bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">G — Empathy</p>
          <p className={cn('text-3xl font-bold', scoreColor(empathyScore * 2))}>
            {empathyScore}
            <span className="text-sm font-normal text-gray-400">/5</span>
          </p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">L — Tone</p>
          <p className={cn('text-3xl font-bold', scoreColor(toneScore * 2))}>
            {toneScore}
            <span className="text-sm font-normal text-gray-400">/5</span>
          </p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">O+D — Ownership</p>
          <p className={cn('text-3xl font-bold', scoreColor(ownershipScore * 2))}>
            {ownershipScore}
            <span className="text-sm font-normal text-gray-400">/5</span>
          </p>
        </div>
        <div
          className={cn(
            'text-center rounded-xl p-3 border-2',
            isBonus
              ? 'bg-amber-50 border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.15)]'
              : 'bg-brand-50 border-brand-300',
          )}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            {isBonus ? 'Final ×2' : 'Total'}
          </p>
          <p className={cn('text-3xl font-bold', scoreColor(totalColorScore))}>
            {finalScore}
            <span className="text-sm font-normal text-gray-400">/{maxTotal}</span>
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
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            <span className="text-amber-500">GOLD</span> Feedback
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
        </div>
      )}

      {/* Improvement tip */}
      {improvementTip && (
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1.5">
            💡 <span className="text-amber-500">GOLD</span> Tip
          </p>
          <p className="text-sm text-amber-800 leading-relaxed">{improvementTip}</p>
        </div>
      )}

      {manualOverride && (
        <p className="text-xs text-amber-500 text-center">
          ✏️ This score was manually adjusted by the facilitator.
        </p>
      )}
    </div>
  );
}
