// ============================================================
// Firebase Admin — Server-side push notification utility
// ============================================================

import admin from 'firebase-admin';
import { createClient } from '@/lib/supabase/server';

// Initialize Firebase Admin (singleton)
if (!admin.apps.length) {
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (serviceAccountRaw) {
    try {
      // Strip surrounding quotes if present (some env loaders add them)
      let raw = serviceAccountRaw.trim();
      if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
        raw = raw.slice(1, -1);
      }

      // Try parsing directly first (works with properly formatted JSON)
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(raw);
      } catch {
        // Fallback: handle malformed escaping (mixed \" and " quotes)
        const fixed = raw.replace(/\\"/g, '"').replace(/\\\\n/g, '\\n');
        serviceAccount = JSON.parse(fixed);
      }
      
      // Ensure private_key has actual newlines (not literal \n strings)
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase Admin] Initialized successfully');
    } catch (e) {
      console.error('[Firebase Admin] Init error:', e);
    }
  } else {
    console.warn('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY not set — push notifications disabled');
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
  if (!admin.apps.length) {
    console.warn('[Firebase Admin] No app initialized, skipping notification');
    return;
  }

  const supabase = await createClient();

  // Get tokens for these users
  const { data: tokens, error: tokenError } = await supabase
    .from('push_tokens')
    .select('token')
    .in('user_id', userIds);

  if (tokenError) {
    console.error('[Firebase Admin] Error fetching tokens:', tokenError);
    return;
  }

  if (!tokens || tokens.length === 0) {
    console.log('[Firebase Admin] No push tokens found for users:', userIds);
    return;
  }

  const tokenList = tokens.map((t) => t.token);

  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokenList,
      // Send data-only message to prevent browser auto-showing a
      // duplicate notification. Our service worker (background) and
      // foreground handler will take care of display.
      data: {
        ...(data || {}),
        title,
        body,
      },
    });

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`[Firebase Admin] Token ${idx} failed:`, resp.error?.code, resp.error?.message);
          if (resp.error?.code === 'messaging/registration-token-not-registered' ||
              resp.error?.code === 'messaging/invalid-registration-token') {
            invalidTokens.push(tokenList[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        await supabase
          .from('push_tokens')
          .delete()
          .in('token', invalidTokens);
        console.log(`[Firebase Admin] Cleaned up ${invalidTokens.length} invalid tokens`);
      }
    }

    console.log(`[Firebase Admin] Sent ${response.successCount}/${tokenList.length} notifications`);
  } catch (error) {
    console.error('[Firebase Admin] Error sending notifications:', error);
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
