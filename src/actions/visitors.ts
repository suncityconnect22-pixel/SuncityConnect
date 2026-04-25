// ============================================================
// Visitors Server Actions
// ============================================================
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .gte('entry_time', today.toISOString())
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

  revalidatePath('/guard');
  revalidatePath('/visitors');
  return { success: true };
}

export async function recordVisitorExit(visitorId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('visitors')
    .update({ exit_time: new Date().toISOString() })
    .eq('id', visitorId);

  if (error) return { error: error.message };

  revalidatePath('/guard');
  revalidatePath('/visitors');
  return { success: true };
}
