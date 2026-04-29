'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission } from './NotificationHandler';
import Button from './ui/Button';

function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone);
  return isIOS && !isStandalone;
}

export default function NotificationToggle() {
  const [status, setStatus] = useState<NotificationPermission | 'unsupported' | 'ios-safari'>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isIOSSafari()) {
      setStatus('ios-safari');
    } else if (!('Notification' in window)) {
      setStatus('unsupported');
    } else {
      setStatus(Notification.permission);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const granted = await requestNotificationPermission();
    if (granted) {
      setStatus('granted');
    } else {
      setStatus(Notification.permission);
    }
    setLoading(false);
  };

  // iOS Safari — show guidance instead of hiding
  if (status === 'ios-safari') {
    return (
      <div className="p-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Notifications (सूचनाएं)</span>
          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">iOS</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">
          To enable notifications on iPhone, tap{' '}
          <span className="inline-flex items-center gap-0.5 font-semibold text-gray-600 dark:text-gray-300">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-2V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V10a2 2 0 012-2h3v2H6v11h12V10h-3V8h3a2 2 0 012 2z"/></svg>
            Share
          </span>{' '}
          → <span className="font-semibold text-gray-600 dark:text-gray-300">&quot;Add to Home Screen&quot;</span>, then open the app from your home screen.
        </p>
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="flex items-center justify-between p-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">Notifications (सूचनाएं)</span>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Not supported</span>
      </div>
    );
  }

  if (status === 'granted') {
    return (
      <div className="flex items-center justify-between p-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">Notifications (सूचनाएं)</span>
        <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
          ✅ Enabled
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500 dark:text-gray-400">Notifications (सूचनाएं)</span>
        {status === 'denied' && (
          <span className="text-xs text-red-500">Blocked in browser settings</span>
        )}
      </div>
      <Button 
        size="sm" 
        onClick={handleEnable} 
        loading={loading}
        disabled={status === 'denied'}
      >
        {status === 'denied' ? 'Blocked' : 'Enable'}
      </Button>
    </div>
  );
}
