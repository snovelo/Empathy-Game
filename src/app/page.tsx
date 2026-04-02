import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-brand-50 to-slate-100">
      {/* Hero */}
      <div className="w-full max-w-lg text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 border border-brand-200">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          Customer Service Training
        </div>

        <h1 className="text-5xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight">
          The Empathy Game
        </h1>
        <p className="text-lg text-slate-500 font-medium mb-10">
          Strategically Aligning With People&apos;s Emotions
        </p>

        {/* Action cards */}
        <div className="grid gap-4 mb-10">
          <Link href="/join" className="block">
            <div className="bg-white rounded-2xl border-2 border-brand-200 hover:border-brand-400 p-6 text-left transition-all duration-200 hover:shadow-md group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🎮
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">Join a Session</p>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Enter a session code to join a live training game
                  </p>
                </div>
                <div className="ml-auto text-brand-400 group-hover:text-brand-600 transition-colors">
                  →
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin" className="block">
            <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-300 p-6 text-left transition-all duration-200 hover:shadow-md group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg">Facilitator Dashboard</p>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Create and manage game sessions
                  </p>
                </div>
                <div className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors">
                  →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-left shadow-sm">
          <h2 className="font-bold text-slate-900 mb-4 text-base">How It Works</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { icon: '📋', title: 'Read the scenario', desc: 'A real customer situation unfolds' },
              { icon: '✍️', title: 'Write your response', desc: '2–4 sentences with empathy and warmth' },
              { icon: '🤖', title: 'Get instant feedback', desc: 'AI scores empathy and tone 1–5' },
              { icon: '🏆', title: 'Team leaderboard', desc: 'Compete and learn together' },
            ].map((step) => (
              <div key={step.title} className="flex gap-2.5">
                <span className="text-xl mt-0.5">{step.icon}</span>
                <div>
                  <p className="font-semibold text-slate-800">{step.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guiding principle */}
        <p className="mt-8 text-slate-400 text-sm italic">
          &ldquo;Validate feelings first. Solve second.&rdquo;
        </p>
      </div>
    </main>
  );
}
