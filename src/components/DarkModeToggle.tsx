'use client';

import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    } else {
      // Ensure light mode is the default
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-between p-1">
      <span className="text-sm text-gray-500 dark:text-gray-400">Dark Mode (डार्क मोड)</span>
      <button
        onClick={toggle}
        className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
          dark 
            ? 'bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.4)]' 
            : 'bg-gray-300'
        }`}
        aria-label="Toggle dark mode"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-sm transition-all duration-300 ${
            dark ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          {dark ? '🌙' : '☀️'}
        </span>
      </button>
    </div>
  );
}
