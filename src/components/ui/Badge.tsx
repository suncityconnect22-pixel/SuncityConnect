import { ReactNode } from 'react';

type BadgeVariant = 'info' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  info: 'bg-blue-50 text-blue-700 border border-blue-200/60',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  danger: 'bg-red-50 text-red-700 border border-red-200/60',
};

export default function Badge({ children, variant = 'info' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
