'use client';

import { useEffect, useState } from 'react';
import { getFirebaseToken, onMessageListener } from '@/lib/firebase';
import { supabase } from '@/lib/supabase/client';
import Toast from '@/components/ui/Toast';

export default function NotificationHandler() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      // Check if notifications are supported
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        console.log('Push notifications not supported');
        return;
      }

      // Don't request permission immediately — wait for user interaction or check status
      if (Notification.permission === 'default') {
        // We'll request on next user interaction — skip for now
        return;
      }

      if (Notification.permission === 'granted') {
        await registerToken();
      }
    };

    setupNotifications();
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener()
      .then((payload: unknown) => {
        const msg = payload as { notification?: { title?: string; body?: string } };
        if (msg.notification) {
          setToast({
            message: `${msg.notification.title}: ${msg.notification.body}`,
            type: 'success',
          });
        }
      })
      .catch((err: unknown) => console.error('Message listener error:', err));

    return () => {
      // onMessageListener returns a promise, cleanup not strictly needed
      void unsubscribe;
    };
  }, []);

  const registerToken = async () => {
    try {
      const token = await getFirebaseToken();
      if (!token) return;

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
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token registered successfully');
      }
    } catch (err) {
      console.error('Error registering push token:', err);
    }
  };

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
  if (!('Notification' in window)) return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
