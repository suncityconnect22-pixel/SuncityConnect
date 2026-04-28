// ============================================================
// Visitors Server Actions
// ============================================================
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendNotificationToHouse } from '@/lib/notifications';
import type { VisitorType } from '@/lib/types';

export async function getMyVisitors() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', data: null };

  // Get user's house number
  const { data: profile } = await supabase
    .from('users')
    .select('house_number')
    .eq('id', user.id)
    .single();

  if (!profile?.house_number) return { error: 'House number not set', data: null };

  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .eq('house_number', profile.house_number)
    .order('entry_time', { ascending: false })
    .limit(50);

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getTodayVisitors() {
  const supabase = await createClient();
  // Calculate IST midnight (UTC+5:30) regardless of server timezone
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5h 30m in ms
  const istNow = new Date(now.getTime() + istOffset);
  const istMidnight = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate()));
  const utcMidnightForIST = new Date(istMidnight.getTime() - istOffset);

  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .gte('entry_time', utcMidnightForIST.toISOString())
    .order('entry_time', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getAllVisitors() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .order('entry_time', { ascending: false })
    .limit(100);

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function recordVisitorEntry(
  house_number: string,
  visitor_type: VisitorType,
  name?: string,
  photo_url?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  if (!house_number?.trim()) {
    return { error: 'House number is required' };
  }

  const { error } = await supabase.from('visitors').insert({
    house_number: house_number.trim().toUpperCase(),
    visitor_type,
    name: name?.trim() || null,
    photo_url: photo_url || null,
    entry_time: new Date().toISOString(),
    recorded_by: user.id,
  });

  if (error) return { error: error.message };

  // Notify house owner
  await sendNotificationToHouse(
    house_number.trim().toUpperCase(),
    '🚪 Visitor Arrival',
    `${visitor_type === 'GUEST' ? 'A guest' : 'A delivery person'} has entered for house ${house_number}.`,
    { url: '/visitors' }
  );

  revalidatePath('/guard');
  revalidatePath('/visitors');
  return { success: true };
}

export async function recordVisitorExit(visitorId: string) {
  const supabase = await createClient();

  // Get visitor details for notification
  const { data: visitor } = await supabase
    .from('visitors')
    .select('house_number, name')
    .eq('id', visitorId)
    .single();

  const { error } = await supabase
    .from('visitors')
    .update({ exit_time: new Date().toISOString() })
    .eq('id', visitorId);

  if (error) return { error: error.message };

  // Notify house owner
  if (visitor) {
    await sendNotificationToHouse(
      visitor.house_number,
      '🚶 Visitor Exit',
      `${visitor.name || 'A visitor'} has left the premises.`,
      { url: '/visitors' }
    );
  }

  revalidatePath('/guard');
  revalidatePath('/visitors');
  return { success: true };
}

export async function deleteVisitor(visitorId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('visitors')
    .delete()
    .eq('id', visitorId);

  if (error) return { error: error.message };

  revalidatePath('/guard');
  revalidatePath('/visitors');
  revalidatePath('/admin/visitors');
  revalidatePath('/dashboard');
  return { success: true };
}
