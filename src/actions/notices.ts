// ============================================================
// Notices Server Actions
// ============================================================
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getNotices() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('is_important', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getLatestNotice() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('is_important', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') return { error: error.message, data: null };
  return { data, error: null };
}

export async function createNotice(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const is_important = formData.get('is_important') === 'true';

  if (!title?.trim() || !description?.trim()) {
    return { error: 'Title and description are required' };
  }

  const { error } = await supabase.from('notices').insert({
    title: title.trim(),
    description: description.trim(),
    is_important,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath('/notices');
  revalidatePath('/admin/notices');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateNotice(noticeId: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const is_important = formData.get('is_important') === 'true';

  const { error } = await supabase
    .from('notices')
    .update({
      title: title.trim(),
      description: description.trim(),
      is_important,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noticeId);

  if (error) return { error: error.message };

  revalidatePath('/notices');
  revalidatePath('/admin/notices');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteNotice(noticeId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('notices')
    .delete()
    .eq('id', noticeId);

  if (error) return { error: error.message };

  revalidatePath('/notices');
  revalidatePath('/admin/notices');
  revalidatePath('/dashboard');
  return { success: true };
}
