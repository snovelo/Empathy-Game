import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-dark-950 via-slate-950 to-dark-900">
      {/* Hero */}
      <div className="w-full max-w-lg text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 border border-brand-500/30">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          Customer Service Training
        </div>

        <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight leading-tight">
          The <span className="text-brand-400">GOLD</span> Standard Game
        </h1>
        <p className="text-lg text-slate-400 font-medium mb-4">
          Lead with Care. Own Every Moment.
        </p>

        {/* GOLD legend */}
        <div className="grid grid-cols-4 gap-2 mb-8 text-center">
          {[
            { letter: 'G', label: 'Go Beyond', sub: 'the Ask' },
            { letter: 'O', label: 'Own Every', sub: 'Moment' },
            { letter: 'L', label: 'Lead with', sub: 'Care' },
            { letter: 'D', label: 'Do It', sub: 'Together' },
          ].map(({ letter, label, sub }) => (
            <div key={letter} className="bg-slate-900 rounded-xl border border-brand-500/30 p-3 shadow-[0_0_8px_rgba(245,158,11,0.08)]">
              <p className="text-2xl font-extrabold text-brand-400">{letter}</p>
              <p className="text-xs font-semibold text-slate-300 leading-tight">{label}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div className="grid gap-4 mb-10">
          <Link href="/join" className="block">
            <div className="bg-slate-900 rounded-2xl border-2 border-brand-500/30 hover:border-brand-400/60 p-6 text-left transition-all duration-200 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-brand-500/20">
                  🎮
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Join a Session</p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Enter a session code to join a live GOLD Standard training game
                  </p>
                </div>
                <div className="ml-auto text-brand-500/50 group-hover:text-brand-400 transition-colors text-lg">
                  →
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin" className="block">
            <div className="bg-slate-900 rounded-2xl border-2 border-slate-800 hover:border-slate-700 p-6 text-left transition-all duration-200 hover:shadow-md group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-slate-700">
                  ⚙️
                </div>
                <div>
                  <p className="font-bold text-white text-lg">Facilitator Dashboard</p>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Create and manage GOLD Standard game sessions
                  </p>
                </div>
                <div className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors text-lg">
                  →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-left shadow-sm">
          <h2 className="font-bold text-white mb-4 text-base">How It Works</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { icon: '📋', title: 'Read the scenario', desc: 'A real customer situation unfolds' },
              { icon: '✍️', title: 'Write your response', desc: 'Apply GOLD: Go beyond, Own it, Lead with care, Do it together' },
              { icon: '🏅', title: 'Get instant feedback', desc: 'Scored on Empathy, Tone, and Ownership (1–5 each)' },
              { icon: '🏆', title: 'Team leaderboard', desc: 'Compete and grow your GOLD Standard skills' },
            ].map((step) => (
              <div key={step.title} className="flex gap-2.5">
                <span className="text-xl mt-0.5">{step.icon}</span>
                <div>
                  <p className="font-semibold text-slate-200">{step.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guiding principle */}
        <p className="mt-8 text-slate-500 text-sm italic">
          &ldquo;Validate feelings first. Own the outcome. Lead with care.&rdquo;
        </p>
      </div>
    </main>
  );
}
