// ============================================================
// Firebase Admin — Server-side push notification utility
// ============================================================

import admin from 'firebase-admin';
import { createClient } from '@/lib/supabase/server';

// Initialize Firebase Admin (singleton)
if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });
    } catch (e) {
      console.error('Firebase Admin init error:', e);
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not set — push notifications disabled');
  }
}

/**
 * Send push notification to specific users by their user IDs
 */
export async function sendNotificationToUsers(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!admin.apps.length) return;

  const supabase = await createClient();

  // Get tokens for these users
  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('token')
    .in('user_id', userIds);

  if (!tokens || tokens.length === 0) return;

  const tokenList = tokens.map((t) => t.token);

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokenList,
      notification: { title, body },
      data: data || {},
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
        },
      },
    });

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(tokenList[idx]);
        }
      });

      if (invalidTokens.length > 0) {
        await supabase
          .from('push_tokens')
          .delete()
          .in('token', invalidTokens);
      }
    }

    console.log(`Sent ${response.successCount}/${tokenList.length} notifications`);
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

/**
 * Send push notification to ALL approved users
 */
export async function sendNotificationToAll(
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!admin.apps.length) return;

  const supabase = await createClient();

  // Get all approved user IDs
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('is_approved', true);

  if (!users || users.length === 0) return;

  const userIds = users.map((u) => u.id);
  await sendNotificationToUsers(userIds, title, body, data);
}

/**
 * Send push notification to users of a specific house
 */
export async function sendNotificationToHouse(
  houseNumber: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (!admin.apps.length) return;

  const supabase = await createClient();

  // Get users for this house
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('house_number', houseNumber)
    .eq('is_approved', true);

  if (!users || users.length === 0) return;

  const userIds = users.map((u) => u.id);
  await sendNotificationToUsers(userIds, title, body, data);
}
