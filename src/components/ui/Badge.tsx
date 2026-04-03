import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'bonus' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    bonus: 'bg-brand-500/20 text-brand-300 border border-brand-500/40',
    success: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50',
    warning: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50',
    error: 'bg-red-900/40 text-red-400 border border-red-700/50',
    info: 'bg-blue-900/40 text-blue-400 border border-blue-700/50',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
