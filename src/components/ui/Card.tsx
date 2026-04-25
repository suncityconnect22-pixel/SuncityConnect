import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  highlight?: boolean;
}

export default function Card({ children, className = '', onClick, highlight }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border ${highlight ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'} p-4 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
