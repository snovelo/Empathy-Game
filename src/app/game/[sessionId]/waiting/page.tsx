'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { teamColor } from '@/lib/utils';

interface SessionData {
  id: string;
  title: string;
  code: string;
  status: string;
  currentRoundIndex: number;
  participants: { id: string; displayName: string; teamName: string }[];
}

export default function WaitingRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [myName, setMyName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('empathy-participant');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setMyName(p.displayName ?? '');
      } catch { /* ignore */ }
    }
  }, []);

  const handleStateChange = useCallback(
    (data: SessionData) => {
      setSession(data);
      if (data.status === 'ACTIVE') {
        router.push(`/game/${sessionId}/round`);
      }
      if (data.status === 'COMPLETED') {
        router.push(`/game/${sessionId}/results`);
      }
    },
    [router, sessionId],
  );

  useEffect(() => {
    // Initial fetch
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((d) => handleStateChange(d))
      .catch(console.error);

    // SSE for real-time updates
    const es = new EventSource(`/api/events/${sessionId}`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'state') handleStateChange(msg.session);
      } catch { /* ignore */ }
    };
    return () => es.close();
  }, [sessionId, handleStateChange]);

  // Group by team
  const teams = new Map<string, typeof session.participants>();
  session?.participants.forEach((p) => {
    const list = teams.get(p.teamName) ?? [];
    list.push(p);
    teams.set(p.teamName, list);
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full px-3 py-1 mb-4 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow" />
            Waiting for game to start
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            {session?.title ?? 'The Empathy Game'}
          </h1>
          {session?.code && (
            <div className="mt-3 inline-flex items-center gap-2">
              <span className="text-slate-500 text-sm">Session code:</span>
              <code className="bg-brand-100 text-brand-700 font-mono font-bold px-3 py-1 rounded-lg text-lg tracking-widest border border-brand-200">
                {session.code}
              </code>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Participants</h2>
            <Badge variant="info">{session?.participants.length ?? 0} joined</Badge>
          </div>

          {session?.participants.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">
              No participants yet. Share the join code!
            </p>
          )}

          <div className="space-y-3">
            {Array.from(teams.entries()).map(([teamName, members]) => (
              <div key={teamName} className="space-y-1.5">
                <div className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${teamColor(teamName)}`}>
                  <span>{teamName}</span>
                  <span className="opacity-60">·</span>
                  <span>{members.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {members.map((p) => (
                    <span
                      key={p.id}
                      className={`text-sm px-3 py-1 rounded-full border font-medium ${
                        p.displayName === myName
                          ? 'bg-brand-100 text-brand-700 border-brand-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p.displayName === myName ? '⭐ ' : ''}
                      {p.displayName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-50 rounded-2xl border border-brand-200 p-4 text-center">
          <p className="text-brand-700 text-sm font-medium">
            The facilitator will start the game when everyone is ready.
          </p>
          <p className="text-brand-500 text-xs mt-1">
            You&apos;ll be redirected automatically when the game begins.
          </p>
        </div>

        {/* Tip */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 text-center font-medium mb-2">💡 Quick Tip</p>
          <p className="text-sm text-slate-600 text-center">
            When responding to customers, always acknowledge the emotion before offering a solution.
            Think: <em>&ldquo;Validate feelings first. Solve second.&rdquo;</em>
          </p>
        </div>
      </div>
    </main>
  );
}
