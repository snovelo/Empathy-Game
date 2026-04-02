'use client';
import { cn, teamColor } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  highlightTeam?: string;
  showWinner?: boolean;
}

export function Leaderboard({ entries, highlightTeam, showWinner }: LeaderboardProps) {
  const sorted = [...entries].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="space-y-3">
      {showWinner && sorted[0] && (
        <div className="text-center py-4 animate-slide-up">
          <p className="text-4xl mb-2">🏆</p>
          <p className="text-2xl font-bold text-slate-900">{sorted[0].teamName}</p>
          <p className="text-brand-600 font-semibold mt-1">Most Empathetic Team</p>
        </div>
      )}

      {sorted.map((entry, idx) => {
        const isFirst = idx === 0;
        const isHighlighted = entry.teamName === highlightTeam;
        const medal = ['🥇', '🥈', '🥉'][idx] ?? `${idx + 1}.`;

        return (
          <div
            key={entry.teamName}
            className={cn(
              'rounded-xl border p-4 transition-all duration-300',
              isFirst && !showWinner && 'border-amber-300 bg-amber-50',
              !isFirst && 'border-slate-200 bg-white',
              isHighlighted && 'ring-2 ring-brand-400',
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl w-8 shrink-0 text-center">{medal}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 truncate">{entry.teamName}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', teamColor(entry.teamName))}>
                    {entry.memberCount} {entry.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
                {/* Member breakdown */}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {entry.members.map((m) => (
                    <span key={m.displayName} className="text-xs text-slate-500">
                      {m.displayName}
                      <span className="font-medium text-slate-700 ml-1">({m.totalScore})</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold tabular-nums text-slate-900">{entry.totalScore}</p>
                <p className="text-xs text-slate-500">pts</p>
              </div>
            </div>
          </div>
        );
      })}

      {sorted.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-4xl mb-2">🎯</p>
          <p>No scores yet — waiting for submissions.</p>
        </div>
      )}
    </div>
  );
}

// Utility to build leaderboard entries from session data
export function buildLeaderboard(
  submissions: Array<{
    participantId: string;
    finalScore: number | null;
    participant: { displayName: string; teamName: string };
  }>,
): LeaderboardEntry[] {
  const teamMap = new Map<
    string,
    { totalScore: number; members: Map<string, number> }
  >();

  for (const sub of submissions) {
    if (sub.finalScore == null) continue;
    const team = sub.participant.teamName;
    const name = sub.participant.displayName;
    if (!teamMap.has(team)) {
      teamMap.set(team, { totalScore: 0, members: new Map() });
    }
    const teamData = teamMap.get(team)!;
    teamData.totalScore += sub.finalScore;
    teamData.members.set(name, (teamData.members.get(name) ?? 0) + sub.finalScore);
  }

  return Array.from(teamMap.entries()).map(([teamName, data]) => ({
    teamName,
    totalScore: data.totalScore,
    memberCount: data.members.size,
    members: Array.from(data.members.entries()).map(([displayName, totalScore]) => ({
      displayName,
      totalScore,
    })),
  }));
}
