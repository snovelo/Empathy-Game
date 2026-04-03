'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Leaderboard, buildLeaderboard } from '@/components/game/Leaderboard';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { teamColor, formatDate, cn } from '@/lib/utils';

interface Submission {
  id: string;
  participantId: string;
  responseText: string;
  empathyScore: number | null;
  toneScore: number | null;
  ownershipScore: number | null;
  totalScore: number | null;
  finalScore: number | null;
  bonusMultiplier: number;
  feedback: string | null;
  improvementTip: string | null;
  manualOverride: boolean;
  submittedAt: string;
  participant: { displayName: string; teamName: string };
}

interface SessionRound {
  id: string;
  orderIndex: number;
  status: string;
  startedAt: string | null;
  closedAt: string | null;
  round: {
    title: string;
    scenario: string;
    task: string;
    isBonus: boolean;
    roboticResponse: string | null;
    facilitatorNote: string | null;
  };
  submissions: Submission[];
}

interface Session {
  id: string;
  code: string;
  title: string;
  status: string;
  currentRoundIndex: number;
  adminKey: string;
  timerEnabled: boolean;
  timerDuration: number;
  allowEdits: boolean;
  revealAfterEach: boolean;
  createdAt: string;
  participants: { id: string; displayName: string; teamName: string; joinedAt: string }[];
  sessionRounds: SessionRound[];
}

type AdminTab = 'overview' | 'submissions' | 'leaderboard';

export default function AdminDashboardPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();

  const keyFromUrl = searchParams.get('key') ?? '';
  const [adminKey, setAdminKey] = useState(keyFromUrl);

  useEffect(() => {
    if (!keyFromUrl) {
      const stored = localStorage.getItem(`admin-key-${sessionId}`) ?? '';
      setAdminKey(stored);
    } else {
      localStorage.setItem(`admin-key-${sessionId}`, keyFromUrl);
    }
  }, [keyFromUrl, sessionId]);

  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<AdminTab>('overview');
  const [actionLoading, setActionLoading] = useState('');
  const [overrideState, setOverrideState] = useState<{
    submissionId: string;
    empathy: number;
    tone: number;
    feedback: string;
  } | null>(null);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchSession = useCallback(async () => {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (res.ok) setSession(await res.json());
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  async function adminAction(endpoint: string) {
    setActionLoading(endpoint);
    try {
      await fetch(`/api/sessions/${sessionId}/${endpoint}`, {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
      });
      await fetchSession();
    } finally {
      setActionLoading('');
    }
  }

  async function overrideScore() {
    if (!overrideState) return;
    setOverrideLoading(true);
    try {
      await fetch(`/api/submissions/${overrideState.submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({
          empathyScore: overrideState.empathy,
          toneScore: overrideState.tone,
          feedback: overrideState.feedback || undefined,
        }),
      });
      setOverrideState(null);
      await fetchSession();
    } finally {
      setOverrideLoading(false);
    }
  }

  async function exportCSV() {
    const url = `/api/export/${sessionId}?key=${adminKey}`;
    window.open(url, '_blank');
  }

  function copyJoinLink() {
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}/join?code=${session?.code}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentSR = session.sessionRounds[session.currentRoundIndex] ?? null;
  const allSubmissions = session.sessionRounds.flatMap((sr) => sr.submissions);
  const leaderboard = buildLeaderboard(allSubmissions);

  const statusColors: Record<string, string> = {
    WAITING: 'bg-slate-800 text-slate-300 border-slate-700',
    ACTIVE: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
    PAUSED: 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
    COMPLETED: 'bg-brand-500/20 text-brand-300 border-brand-500/40',
  };

  return (
    <main className="min-h-screen bg-dark-950">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-10 bg-dark-900 border-b border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-white">{session.title}</h1>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border font-semibold', statusColors[session.status])}>
              {session.status}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyJoinLink}
              className="text-xs bg-brand-500/10 text-brand-300 border border-brand-500/30 px-3 py-1.5 rounded-lg font-mono font-semibold hover:bg-brand-500/20 transition-colors"
            >
              {copySuccess ? '✓ Copied!' : `Code: ${session.code}`}
            </button>

            {session.status === 'WAITING' && (
              <Button
                onClick={() => adminAction('start')}
                loading={actionLoading === 'start'}
                size="sm"
              >
                Start Game
              </Button>
            )}
            {session.status === 'ACTIVE' && (
              <>
                <Button
                  onClick={() => adminAction('advance')}
                  loading={actionLoading === 'advance'}
                  size="sm"
                >
                  {session.currentRoundIndex < session.sessionRounds.length - 1
                    ? 'Next Round →'
                    : 'End Game'}
                </Button>
                <Button
                  onClick={() => adminAction('end')}
                  loading={actionLoading === 'end'}
                  size="sm"
                  variant="danger"
                >
                  End Now
                </Button>
              </>
            )}
            <Button onClick={exportCSV} size="sm" variant="secondary">
              Export CSV
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 border-t border-slate-800">
          {(['overview', 'submissions', 'leaderboard'] as AdminTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize',
                tab === t
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Session info */}
            <Card>
              <h2 className="font-bold text-white mb-4">Session Info</h2>
              <dl className="space-y-2 text-sm">
                {[
                  { label: 'Code', value: session.code },
                  { label: 'Status', value: session.status },
                  { label: 'Created', value: formatDate(session.createdAt) },
                  {
                    label: 'Round',
                    value:
                      session.status === 'WAITING'
                        ? 'Not started'
                        : `${session.currentRoundIndex + 1} / ${session.sessionRounds.length}`,
                  },
                  { label: 'Participants', value: session.participants.length },
                  { label: 'Submissions', value: allSubmissions.length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-800">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* Current round */}
            {currentSR && (
              <Card variant={currentSR.round.isBonus ? 'bonus' : 'default'}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-bold text-white">Current Round</h2>
                  {currentSR.round.isBonus && <Badge variant="bonus">⚡ Bonus</Badge>}
                  <Badge
                    variant={currentSR.status === 'ACTIVE' ? 'success' : 'default'}
                    className="ml-auto"
                  >
                    {currentSR.status}
                  </Badge>
                </div>
                <p className="font-semibold text-slate-200 mb-2">{currentSR.round.title}</p>
                <p className="text-sm text-slate-400 mb-3 italic">
                  {currentSR.round.scenario.slice(0, 120)}…
                </p>
                {currentSR.round.facilitatorNote && (
                  <div className="bg-brand-950/40 border border-brand-700/40 rounded-lg p-3 text-xs text-brand-300">
                    <strong>Facilitator note:</strong> {currentSR.round.facilitatorNote}
                  </div>
                )}
                <p className="text-sm text-slate-500 mt-3">
                  {currentSR.submissions.length} submission{currentSR.submissions.length !== 1 && 's'} received
                </p>
              </Card>
            )}

            {/* Participants */}
            <Card className="md:col-span-2">
              <h2 className="font-bold text-white mb-4">
                Participants ({session.participants.length})
              </h2>
              {session.participants.length === 0 ? (
                <p className="text-slate-500 text-sm">No participants yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {session.participants.map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', teamColor(p.teamName))}>
                        {p.teamName}
                      </span>
                      <span className="text-sm text-slate-300">{p.displayName}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {tab === 'submissions' && (
          <div className="space-y-6">
            {session.sessionRounds.map((sr) => (
              <div key={sr.id} className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
                <div className={cn(
                  'flex items-center justify-between px-5 py-3 border-b',
                  sr.round.isBonus ? 'bg-brand-950/30 border-brand-800/40' : 'bg-slate-800 border-slate-700',
                )}>
                  <div className="flex items-center gap-2">
                    {sr.round.isBonus && <Badge variant="bonus">⚡</Badge>}
                    <h3 className="font-semibold text-white text-sm">{sr.round.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={sr.status === 'ACTIVE' ? 'success' : sr.status === 'CLOSED' ? 'default' : 'warning'}>
                      {sr.status}
                    </Badge>
                    <span className="text-xs text-slate-500">{sr.submissions.length} responses</span>
                  </div>
                </div>

                {sr.submissions.length === 0 ? (
                  <p className="px-5 py-4 text-slate-500 text-sm">No submissions yet.</p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {sr.submissions.map((sub) => (
                      <div key={sub.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-sm">
                                {sub.participant.displayName}
                              </span>
                              <span className={cn('text-xs px-2 py-0.5 rounded-full border', teamColor(sub.participant.teamName))}>
                                {sub.participant.teamName}
                              </span>
                              {sub.manualOverride && (
                                <span className="text-xs text-brand-400">✏️ edited</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(sub.submittedAt)}</p>
                          </div>
                          {sub.finalScore != null && (
                            <div className="text-right shrink-0">
                              <span className="text-lg font-bold text-brand-400">{sub.finalScore}</span>
                              <span className="text-xs text-slate-500 ml-1">pts</span>
                            </div>
                          )}
                        </div>

                        <blockquote className="text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-3 leading-relaxed">
                          {sub.responseText}
                        </blockquote>

                        {sub.empathyScore != null && (
                          <div className="mb-3">
                            <ScoreDisplay
                              empathyScore={sub.empathyScore}
                              toneScore={sub.toneScore!}
                              ownershipScore={sub.ownershipScore ?? 1}
                              totalScore={sub.totalScore!}
                              finalScore={sub.finalScore!}
                              isBonus={sr.round.isBonus}
                              feedback={sub.feedback ?? undefined}
                              improvementTip={sub.improvementTip ?? undefined}
                              manualOverride={sub.manualOverride}
                            />
                          </div>
                        )}

                        {/* Override button */}
                        <button
                          className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                          onClick={() =>
                            setOverrideState({
                              submissionId: sub.id,
                              empathy: sub.empathyScore ?? 3,
                              tone: sub.toneScore ?? 3,
                              feedback: sub.feedback ?? '',
                            })
                          }
                        >
                          Override Score
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {tab === 'leaderboard' && (
          <div className="max-w-lg mx-auto">
            <Card>
              <h2 className="font-bold text-white mb-4">Team Leaderboard</h2>
              <Leaderboard entries={leaderboard} showWinner={session.status === 'COMPLETED'} />
            </Card>
          </div>
        )}
      </div>

      {/* Score Override Modal */}
      {overrideState && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Override score"
        >
          <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="font-bold text-white mb-4">Override Score</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  Empathy Score (1–5)
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={overrideState.empathy}
                  onChange={(e) =>
                    setOverrideState((s) => s && { ...s, empathy: Number(e.target.value) })
                  }
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={overrideState.empathy === n ? 'font-bold text-brand-400' : ''}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  Tone Score (1–5)
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={overrideState.tone}
                  onChange={(e) =>
                    setOverrideState((s) => s && { ...s, tone: Number(e.target.value) })
                  }
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={overrideState.tone === n ? 'font-bold text-brand-400' : ''}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                <p className="text-sm text-slate-400">New total score</p>
                <p className="text-2xl font-bold text-brand-400">
                  {overrideState.empathy + overrideState.tone}
                  <span className="text-sm text-slate-500">/10</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">
                  Feedback (optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                  value={overrideState.feedback}
                  onChange={(e) =>
                    setOverrideState((s) => s && { ...s, feedback: e.target.value })
                  }
                  placeholder="Reason for override..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setOverrideState(null)}
              >
                Cancel
              </Button>
              <Button className="flex-1" loading={overrideLoading} onClick={overrideScore}>
                Save Override
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
