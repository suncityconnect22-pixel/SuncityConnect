'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bell, MessageSquare, User, Shield, Users, ClipboardList } from 'lucide-react';
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
          { href: '/dashboard', icon: Home, label: 'Home (होम)' },
          { href: '/admin', icon: Shield, label: 'Manage' },
          { href: '/admin/users', icon: Users, label: 'Users' },
          { href: '/profile', icon: User, label: 'Profile' },
        ];
      case 'admin':
        return [
          { href: '/dashboard', icon: Home, label: 'Home (होम)' },
          { href: '/admin', icon: Shield, label: 'Manage' },
          { href: '/complaints', icon: ClipboardList, label: 'Complaints' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && item.href !== '/guard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[64px] tap-target rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
