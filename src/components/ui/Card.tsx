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
      className={`bg-white rounded-3xl border ${
        highlight 
          ? 'border-blue-200 bg-blue-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]' 
          : 'border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'
      } p-5 ${
        onClick 
          ? 'cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300' 
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
