import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generates a short, human-readable session join code (e.g. "HERO42")
const nanoid = customAlphabet('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 6);
export function generateCode(): string {
  return nanoid();
}

// Generates a secure random key for admin access / participant rejoin
const secureId = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  32,
);
export function generateSecretKey(): string {
  return secureId();
}

export function formatScore(score: number | null | undefined): string {
  if (score == null) return '—';
  return score.toString();
}

export function teamColor(teamName: string): string {
  const colors = [
    'bg-violet-100 text-violet-800 border-violet-200',
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-rose-100 text-rose-800 border-rose-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-teal-100 text-teal-800 border-teal-200',
  ];
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function scoreColor(score: number): string {
  if (score >= 9) return 'text-emerald-600';
  if (score >= 7) return 'text-blue-600';
  if (score >= 5) return 'text-amber-600';
  return 'text-red-500';
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
