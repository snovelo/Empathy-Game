import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bonus' | 'elevated';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    bonus: 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md',
    elevated: 'bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow',
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
    <h2 className={cn('text-xl font-bold text-slate-900', className)} {...props}>
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
