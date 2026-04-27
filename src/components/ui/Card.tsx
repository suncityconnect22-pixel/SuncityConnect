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
      className={`bg-white rounded-2xl border ${
        highlight 
          ? 'border-blue-200 bg-gradient-to-br from-blue-50/60 to-white shadow-[0_4px_20px_rgb(59,130,246,0.08)]' 
          : 'border-gray-100/80 shadow-[0_2px_12px_rgb(0,0,0,0.03)]'
      } p-4 ${
        onClick 
          ? 'cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200' 
          : 'transition-shadow duration-200'
      } ${className}`}
    >
      {children}
    </div>
  );
}
