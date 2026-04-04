import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Hero */}
      <div className="w-full max-w-lg text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6 border border-brand-200">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          Customer Service Training
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight leading-tight">
          The <span className="text-amber-500">GOLD</span> Standard Game
        </h1>
        <p className="text-lg text-gray-500 font-medium mb-4">
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
            <div key={letter} className="bg-white rounded-xl border border-amber-200 p-3 shadow-sm">
              <p className="text-2xl font-extrabold text-amber-500">{letter}</p>
              <p className="text-xs font-semibold text-gray-700 leading-tight">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div className="grid gap-4 mb-10">
          <Link href="/join" className="block">
            <div className="bg-white rounded-2xl border-2 border-brand-300 hover:border-brand-500 p-6 text-left transition-all duration-200 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-brand-200">
                  🎮
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Join a Session</p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Enter a session code to join a live <span className="text-amber-500 font-medium">GOLD</span> Standard training game
                  </p>
                </div>
                <div className="ml-auto text-brand-400 group-hover:text-brand-600 transition-colors text-lg">
                  →
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin" className="block">
            <div className="bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-300 p-6 text-left transition-all duration-200 hover:shadow-md group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-gray-200">
                  ⚙️
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Facilitator Dashboard</p>
                  <p className="text-gray-500 text-sm mt-0.5">
                    Create and manage <span className="text-amber-500 font-medium">GOLD</span> Standard game sessions
                  </p>
                </div>
                <div className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors text-lg">
                  →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 text-base">How It Works</h2>
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
                  <p className="font-semibold text-gray-800">{step.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guiding principle */}
        <p className="mt-8 text-gray-400 text-sm italic">
          &ldquo;Validate feelings first. Own the outcome. Lead with care.&rdquo;
        </p>
      </div>
    </main>
  );
}
