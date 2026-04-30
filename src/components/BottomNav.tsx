'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bell, MessageSquare, User, Shield, Users, ClipboardList, Eye } from 'lucide-react';
import type { UserRole } from '@/lib/types';

interface BottomNavProps {
  role: UserRole;
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    switch (role) {
      case 'guard':
        return [
          { href: '/guard', icon: Home, label: 'Entry (प्रवेश)' },
          { href: '/profile', icon: User, label: 'Profile' },
        ];
      case 'super_admin':
        return [
          { href: '/dashboard', icon: Home, label: 'Home' },
          { href: '/admin', icon: Shield, label: 'Manage' },
          { href: '/complaints', icon: MessageSquare, label: 'My Issues' },
          { href: '/visitors', icon: Eye, label: 'Visitors' },
          { href: '/profile', icon: User, label: 'Profile' },
        ];
      case 'admin':
        return [
          { href: '/dashboard', icon: Home, label: 'Home' },
          { href: '/admin', icon: Shield, label: 'Manage' },
          { href: '/complaints', icon: MessageSquare, label: 'My Issues' },
          { href: '/visitors', icon: Eye, label: 'Visitors' },
          { href: '/profile', icon: User, label: 'Profile' },
        ];
      default: // user
        return [
          { href: '/dashboard', icon: Home, label: 'Home (होम)' },
          { href: '/notices', icon: Bell, label: 'Notices (सूचना)' },
          { href: '/complaints', icon: MessageSquare, label: 'Complaints' },
          { href: '/profile', icon: User, label: 'Profile' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#1a1d27]/95 backdrop-blur-lg border-t border-gray-200/80 dark:border-[#2a2d3a]/80 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && item.href !== '/guard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 min-w-[56px] rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95'
              }`}
            >
              <div className={`relative p-1 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 dark:bg-blue-500/15' : ''}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              </div>
              <span className={`text-[9px] mt-0.5 font-medium leading-tight text-center ${isActive ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
