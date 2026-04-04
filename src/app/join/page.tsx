'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

const SUGGESTED_TEAMS = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') ?? '';

  const [form, setForm] = useState({
    sessionCode: codeParam.toUpperCase(),
    displayName: '',
    teamName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('empathy-participant');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.displayName) setForm((f) => ({ ...f, displayName: parsed.displayName }));
        if (parsed.teamName) setForm((f) => ({ ...f, teamName: parsed.teamName }));
      } catch { /* ignore */ }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.sessionCode.trim()) return setError('Please enter a session code.');
    if (!form.displayName.trim()) return setError('Please enter your name.');
    if (!form.teamName.trim()) return setError('Please enter a team name.');

    setLoading(true);
    try {
      const savedKey = localStorage.getItem('empathy-session-key') ?? undefined;

      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: form.sessionCode.toUpperCase().trim(),
          displayName: form.displayName.trim(),
          teamName: form.teamName.trim(),
          sessionKey: savedKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      localStorage.setItem('empathy-session-key', data.sessionKey);
      localStorage.setItem(
        'empathy-participant',
        JSON.stringify({
          participantId: data.participantId,
          displayName: data.displayName,
          teamName: data.teamName,
          sessionId: data.sessionId,
          sessionKey: data.sessionKey,
        }),
      );

      router.push(`/game/${data.sessionId}/waiting`);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Join a Session</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter the session code shared by your facilitator
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Session Code"
          placeholder="e.g. HERO42"
          value={form.sessionCode}
          onChange={(e) =>
            setForm((f) => ({ ...f, sessionCode: e.target.value.toUpperCase().trim() }))
          }
          maxLength={10}
          autoComplete="off"
          autoCapitalize="characters"
          required
        />

        <Input
          label="Your Name"
          placeholder="e.g. Alex Johnson"
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          maxLength={60}
          required
        />

        <div className="space-y-2">
          <Input
            label="Team Name"
            placeholder="e.g. Team Alpha"
            value={form.teamName}
            onChange={(e) => setForm((f) => ({ ...f, teamName: e.target.value }))}
            maxLength={60}
            required
          />
          <div className="flex flex-wrap gap-2 pt-0.5">
            {SUGGESTED_TEAMS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, teamName: t }))}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                  form.teamName === t
                    ? 'bg-brand-100 text-brand-700 border-brand-300'
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          >
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Join Game
        </Button>
      </form>
    </div>
  );
}

export default function JoinPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="w-full max-w-md animate-slide-up">
        <Link href="/" className="flex items-center gap-2 text-brand-600 text-sm font-medium mb-8 hover:text-brand-700 transition-colors">
          ← Back to home
        </Link>
        <Suspense fallback={
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }>
          <JoinForm />
        </Suspense>
      </div>
    </main>
  );
}
