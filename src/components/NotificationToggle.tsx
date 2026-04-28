'use client';

import { useState, useEffect } from 'react';
import { requestNotificationPermission } from './NotificationHandler';
import Button from './ui/Button';

export default function NotificationToggle() {
  const [status, setStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) {
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
      // The NotificationHandler in layout will pick this up and register the token
      window.location.reload(); // Simple way to re-trigger the handler's useEffect
    } else {
      setStatus(Notification.permission);
    }
    setLoading(false);
  };

  if (status === 'unsupported') return null;
  if (status === 'granted') {
    return (
      <div className="flex items-center justify-between p-1">
        <span className="text-sm text-gray-500">Notifications (सूचनाएं)</span>
        <span className="text-sm font-medium text-green-600 flex items-center gap-1">
          ✅ Enabled
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Notifications (सूचनाएं)</span>
        {status === 'denied' && (
          <span className="text-xs text-red-500">Blocked in browser</span>
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
