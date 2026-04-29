'use client';

import { useEffect, useState, useCallback } from 'react';
import { getFirebaseToken, onForegroundMessage } from '@/lib/firebase';
import { supabase } from '@/lib/supabase/client';
import Toast from '@/components/ui/Toast';

export default function NotificationHandler() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const registerToken = useCallback(async () => {
    try {
      const token = await getFirebaseToken();
      if (!token) {
        console.warn('[FCM] No token received');
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save token to Supabase
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: user.id,
            token,
            device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
            created_at: new Date().toISOString(),
          },
          { onConflict: 'token' }
        );

      if (error) {
        console.error('[FCM] Error saving push token:', error);
      } else {
        console.log('[FCM] Push token registered successfully');
      }
    } catch (err) {
      console.error('[FCM] Error registering push token:', err);
    }
  }, []);

  // Register token if permission is already granted
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('[FCM] Push notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      registerToken();
    }
  }, [registerToken]);

  // Listen for foreground messages — stays active for the entire session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = onForegroundMessage((payload) => {
      if (payload.notification) {
        setToast({
          message: `${payload.notification.title || ''}: ${payload.notification.body || ''}`,
          type: 'success',
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

// Export a function that can be called to request permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    // Immediately register token after granting permission
    try {
      const token = await getFirebaseToken();
      if (token) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('push_tokens')
            .upsert(
              {
                user_id: user.id,
                token,
                device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                created_at: new Date().toISOString(),
              },
              { onConflict: 'token' }
            );
          console.log('[FCM] Token registered after permission grant');
        }
      }
    } catch (err) {
      console.error('[FCM] Error registering token after permission:', err);
    }
  }
  return permission === 'granted';
}
