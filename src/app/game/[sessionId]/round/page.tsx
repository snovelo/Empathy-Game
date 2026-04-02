'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { CountdownTimer } from '@/components/game/CountdownTimer';
import { Leaderboard, buildLeaderboard } from '@/components/game/Leaderboard';
import { cn } from '@/lib/utils';

const MAX_CHARS = 1200;

interface SessionRound {
  id: string;
  orderIndex: number;
  status: string;
  startedAt: string | null;
  round: {
    title: string;
    scenario: string;
    task: string;
    isBonus: boolean;
    roboticResponse: string | null;
  };
  submissions: Array<{
    id: string;
    participantId: string;
    empathyScore: number | null;
    toneScore: number | null;
    totalScore: number | null;
    finalScore: number | null;
    bonusMultiplier: number;
    feedback: string | null;
    improvementTip: string | null;
    manualOverride: boolean;
    participant: { displayName: string; teamName: string };
  }>;
}

interface Session {
  id: string;
  title: string;
  status: string;
  currentRoundIndex: number;
  timerEnabled: boolean;
  timerDuration: number;
  allowEdits: boolean;
  revealAfterEach: boolean;
  sessionRounds: SessionRound[];
}

interface Participant {
  participantId: string;
  sessionKey: string;
  displayName: string;
  teamName: string;
}

type Phase = 'writing' | 'submitted' | 'roundClosed' | 'showingLeaderboard';

export default function RoundPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [response, setResponse] = useState('');
  const [phase, setPhase] = useState<Phase>('writing');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [mySubmission, setMySubmission] = useState<SessionRound['submissions'][0] | null>(null);
  const prevRoundIdxRef = useRef<number>(-1);

  useEffect(() => {
    const saved = localStorage.getItem('empathy-participant');
    if (!saved) { router.push('/join'); return; }
    try { setParticipant(JSON.parse(saved)); } catch { router.push('/join'); }
  }, [router]);

  const processSession = useCallback(
    (data: Session) => {
      setSession(data);

      if (data.status === 'COMPLETED') {
        router.push(`/game/${sessionId}/results`);
        return;
      }

      const roundIdx = data.currentRoundIndex;
      const currentSR = data.sessionRounds[roundIdx];
      if (!currentSR) return;

      // If round index changed, reset state
      if (roundIdx !== prevRoundIdxRef.current) {
        prevRoundIdxRef.current = roundIdx;
        setResponse('');
        setPhase('writing');
        setMySubmission(null);
        setSubmitError('');
      }
    },
    [router, sessionId],
  );

  // Load participant's existing submission from session data
  useEffect(() => {
    if (!session || !participant) return;
    const currentSR = session.sessionRounds[session.currentRoundIndex];
    if (!currentSR) return;

    const mine = currentSR.submissions.find(
      (s) => s.participantId === participant.participantId,
    );
    if (mine) {
      setMySubmission(mine);
      if (currentSR.status === 'ACTIVE') {
        setPhase('submitted');
      } else {
        setPhase('roundClosed');
      }
    } else if (currentSR.status !== 'ACTIVE') {
      setPhase('roundClosed');
    }
  }, [session, participant]);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then(processSession)
      .catch(console.error);

    const es = new EventSource(`/api/events/${sessionId}`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'state') processSession(msg.session);
      } catch { /* ignore */ }
    };
    return () => es.close();
  }, [sessionId, processSession]);

  async function handleSubmit() {
    if (!participant || !session) return;
    const currentSR = session.sessionRounds[session.currentRoundIndex];
    if (!currentSR) return;

    if (response.trim().split(/\s+/).length < 4) {
      setSubmitError('Please write at least a few sentences (10+ words).');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionRoundId: currentSR.id,
          participantId: participant.participantId,
          sessionKey: participant.sessionKey,
          responseText: response.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? 'Submission failed. Please try again.');
        return;
      }
      setMySubmission(data.submission);
      setPhase('submitted');
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading game...</p>
        </div>
      </div>
    );
  }

  const currentSR = session.sessionRounds[session.currentRoundIndex];
  if (!currentSR) return null;

  const { round } = currentSR;
  const totalRounds = session.sessionRounds.length;
  const roundNum = session.currentRoundIndex + 1;

  // All submissions for leaderboard
  const allSubmissions = session.sessionRounds.flatMap((sr) => sr.submissions);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Header bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700">
              Round {roundNum} of {totalRounds}
            </div>
            {round.isBonus && (
              <Badge variant="bonus">⚡ Bonus Round — 2× Points</Badge>
            )}
          </div>
          <div className="text-sm text-slate-500">
            {currentSR.submissions.length} response{currentSR.submissions.length !== 1 && 's'} in
          </div>
        </div>

        {/* Timer */}
        {session.timerEnabled && currentSR.startedAt && currentSR.status === 'ACTIVE' && (
          <CountdownTimer
            startedAt={currentSR.startedAt}
            durationSeconds={session.timerDuration}
          />
        )}

        {/* Scenario card */}
        <Card variant={round.isBonus ? 'bonus' : 'default'}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                {round.isBonus ? '⚡ Bonus — Make It Human' : 'Customer Scenario'}
              </p>
              <h2 className="text-xl font-bold text-slate-900">{round.title}</h2>
            </div>

            {/* Customer quote */}
            <blockquote className="border-l-4 border-brand-400 pl-4 italic text-slate-700 leading-relaxed bg-brand-50 py-3 pr-4 rounded-r-xl">
              {round.scenario}
            </blockquote>

            {/* Robotic response for bonus rounds */}
            {round.roboticResponse && (
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  🤖 Robotic Response to Rewrite
                </p>
                <p className="text-sm text-slate-600 italic">{round.roboticResponse}</p>
              </div>
            )}

            {/* Task */}
            <div className="bg-white rounded-xl p-4 border border-dashed border-slate-300">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1.5">
                Your Task
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {round.task}
              </p>
            </div>
          </div>
        </Card>

        {/* Response area */}
        {phase === 'writing' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 animate-slide-up">
            <Textarea
              label="Your Response"
              placeholder="Write an empathetic, warm response to this customer in 2–4 sentences..."
              rows={6}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              maxLength={MAX_CHARS}
              charCount={response.length}
              maxChars={MAX_CHARS}
              hint="Aim for 2–4 sentences. Validate the feeling first, then offer help."
              disabled={submitting}
            />

            {submitError && (
              <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {submitError}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              loading={submitting}
              className="w-full"
              size="lg"
              disabled={response.trim().length < 10}
            >
              Submit Response
            </Button>
          </div>
        )}

        {/* Submitted — awaiting round close */}
        {phase === 'submitted' && !mySubmission?.empathyScore && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 text-center animate-slide-up">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-emerald-800 font-bold text-lg">Response submitted!</p>
            <p className="text-emerald-600 text-sm mt-1">
              Hang tight — scores will be revealed when the round closes.
            </p>
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Your response
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{response}</p>
            </div>
            {session.allowEdits && (
              <button
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-800 font-medium underline"
                onClick={() => setPhase('writing')}
              >
                Edit response
              </button>
            )}
          </div>
        )}

        {/* Scored */}
        {(phase === 'roundClosed' || phase === 'submitted') && mySubmission?.empathyScore != null && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-1">Your Score</h3>
              <p className="text-sm text-slate-500 mb-4">Here&apos;s how your response scored on empathy and tone.</p>
              <ScoreDisplay
                empathyScore={mySubmission.empathyScore!}
                toneScore={mySubmission.toneScore!}
                totalScore={mySubmission.totalScore!}
                finalScore={mySubmission.finalScore!}
                isBonus={round.isBonus}
                feedback={mySubmission.feedback ?? undefined}
                improvementTip={mySubmission.improvementTip ?? undefined}
                manualOverride={mySubmission.manualOverride}
              />
            </div>

            {/* Leaderboard */}
            {session.revealAfterEach && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">Team Leaderboard</h3>
                <Leaderboard
                  entries={buildLeaderboard(allSubmissions)}
                  highlightTeam={participant?.teamName}
                />
              </div>
            )}
          </div>
        )}

        {/* Waiting for facilitator */}
        {phase === 'roundClosed' && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium rounded-full px-4 py-2 border border-brand-200">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping-slow" />
              Waiting for facilitator to advance...
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
