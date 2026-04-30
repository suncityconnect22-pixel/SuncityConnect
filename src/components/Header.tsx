'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

export default function Header({ title, showBack = false, action }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1a1d27]/90 backdrop-blur-md border-b border-gray-100/80 dark:border-[#2a2d3a]/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-[#2a2d3a] rounded-full transition-colors tap-target"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
          {title === 'SuncityConnect' ? (
            <Image 
              src="/suncity-text-logo.png" 
              alt="SuncityConnect" 
              width={180} 
              height={36} 
              className="h-8 w-auto"
              priority
            />
          ) : (
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 opacity-60" />
    </header>
  );
}
