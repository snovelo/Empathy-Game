'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Leaderboard, buildLeaderboard } from '@/components/game/Leaderboard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, scoreColor } from '@/lib/utils';
import Link from 'next/link';

interface Submission {
  id: string;
  participantId: string;
  empathyScore: number | null;
  toneScore: number | null;
  totalScore: number | null;
  finalScore: number | null;
  bonusMultiplier: number;
  feedback: string | null;
  participant: { displayName: string; teamName: string };
}

interface SessionRound {
  id: string;
  orderIndex: number;
  status: string;
  round: {
    title: string;
    isBonus: boolean;
    scenario: string;
  };
  submissions: Submission[];
}

interface Session {
  id: string;
  title: string;
  status: string;
  sessionRounds: SessionRound[];
}

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantTeam, setParticipantTeam] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('empathy-participant');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setParticipantId(p.participantId ?? '');
        setParticipantName(p.displayName ?? '');
        setParticipantTeam(p.teamName ?? '');
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then(setSession)
      .catch(console.error);
  }, [sessionId]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allSubmissions = session.sessionRounds.flatMap((sr) => sr.submissions);
  const leaderboard = buildLeaderboard(allSubmissions);

  // My submissions
  const myRoundScores = session.sessionRounds
    .map((sr) => {
      const mine = sr.submissions.find((s) => s.participantId === participantId);
      return { round: sr.round, submission: mine ?? null };
    })
    .filter((x) => x.submission);

  const myTotalScore = myRoundScores.reduce(
    (acc, x) => acc + (x.submission?.finalScore ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Hero */}
        <div className="text-center py-6">
          <p className="text-6xl mb-4 animate-slide-up">🎉</p>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Game Over!</h1>
          <p className="text-slate-500">Thanks for playing {session.title}</p>
        </div>

        {/* Winner banner */}
        {leaderboard.length > 0 && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-6 text-white text-center shadow-lg">
            <p className="text-2xl mb-1">🏆</p>
            <p className="text-xl font-bold">{leaderboard.sort((a, b) => b.totalScore - a.totalScore)[0]?.teamName}</p>
            <p className="text-amber-100 text-sm font-medium mt-0.5">Most Empathetic Team</p>
          </div>
        )}

        {/* My performance */}
        {participantId && myRoundScores.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Your Performance</h2>
              <div className="text-right">
                <p className={cn('text-2xl font-bold', scoreColor(myTotalScore))}>{myTotalScore}</p>
                <p className="text-xs text-slate-500">total pts</p>
              </div>
            </div>
            <div className="space-y-2">
              {myRoundScores.map(({ round, submission }) => (
                <div
                  key={round.title}
                  className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {round.isBonus && <Badge variant="bonus">⚡</Badge>}
                    <span className="text-sm text-slate-700 truncate">{round.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500">
                      E:{submission!.empathyScore ?? '—'} T:{submission!.toneScore ?? '—'}
                    </span>
                    <span className={cn('text-sm font-bold tabular-nums', scoreColor(submission!.finalScore ?? 0))}>
                      {submission!.finalScore ?? '—'}
                      {round.isBonus && (
                        <span className="text-xs font-normal text-amber-600 ml-0.5">×2</span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-4">Final Team Leaderboard</h2>
          <Leaderboard
            entries={leaderboard}
            highlightTeam={participantTeam}
            showWinner={false}
          />
        </div>

        {/* Round summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 mb-4">Round Summary</h2>
          <div className="space-y-3">
            {session.sessionRounds
              .filter((sr) => sr.status === 'CLOSED')
              .map((sr) => {
                const avg =
                  sr.submissions.length > 0
                    ? sr.submissions.reduce((a, s) => a + (s.finalScore ?? 0), 0) /
                      sr.submissions.length
                    : null;
                return (
                  <div key={sr.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      {sr.round.isBonus && <Badge variant="bonus">⚡</Badge>}
                      <span className="text-sm text-slate-700">{sr.round.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-700">
                        {sr.submissions.length} responses
                      </span>
                      {avg !== null && (
                        <span className="text-xs text-slate-500 ml-2">
                          avg {avg.toFixed(1)} pts
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pb-6">
          <p className="text-slate-400 text-sm italic mb-4">
            &ldquo;Validate feelings first. Solve second.&rdquo;
          </p>
          <Link href="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
