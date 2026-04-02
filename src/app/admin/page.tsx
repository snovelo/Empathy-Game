'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function AdminLandingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: 'The Empathy Game',
    timerEnabled: false,
    timerDuration: 120,
    allowEdits: true,
    revealAfterEach: true,
    allowLateJoin: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createSession() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create session.');
        return;
      }
      // Store admin key
      localStorage.setItem(`admin-key-${data.id}`, data.adminKey);
      router.push(`/admin/sessions/${data.id}?key=${data.adminKey}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-brand-600 text-sm font-medium hover:text-brand-700">
            ← Back to home
          </Link>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 font-medium">
            Facilitator Mode
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create a Session</h1>
          <p className="text-slate-500 text-sm mb-8">
            Set up a new Empathy Game session for your team.
          </p>

          <div className="space-y-5">
            <Input
              label="Session Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              maxLength={100}
            />

            {/* Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Round Timer</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.timerEnabled}
                  onClick={() => setForm((f) => ({ ...f, timerEnabled: !f.timerEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    form.timerEnabled ? 'bg-brand-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      form.timerEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {form.timerEnabled && (
                <Input
                  label="Timer Duration (seconds)"
                  type="number"
                  min={30}
                  max={600}
                  value={form.timerDuration}
                  onChange={(e) => setForm((f) => ({ ...f, timerDuration: Number(e.target.value) }))}
                  hint="30–600 seconds (2 min = 120)"
                />
              )}
            </div>

            {/* Toggles */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              {(
                [
                  { key: 'allowEdits', label: 'Allow response edits before round closes' },
                  { key: 'revealAfterEach', label: 'Show leaderboard after each round' },
                  { key: 'allowLateJoin', label: 'Allow participants to join mid-game' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form[key]}
                    onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form[key] ? 'bg-brand-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        form[key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button onClick={createSession} loading={loading} className="w-full" size="lg">
              Create Session
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          For internal training use only · Not for live customer interactions
        </p>
      </div>
    </main>
  );
}
