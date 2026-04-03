import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bonus' | 'elevated';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-slate-900 border border-slate-800 shadow-sm',
    bonus: 'bg-gradient-to-br from-amber-950/60 to-yellow-950/40 border-2 border-brand-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    elevated: 'bg-slate-900 border border-slate-700 shadow-md hover:shadow-[0_0_16px_rgba(245,158,11,0.1)] transition-shadow',
  };
  return (
    <div className={cn('rounded-2xl p-6', variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-xl font-bold text-white', className)} {...props}>
      {children}
    </h2>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
