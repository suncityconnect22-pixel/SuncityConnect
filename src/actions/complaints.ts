// ============================================================
// Complaints Server Actions
// ============================================================
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendNotificationToUsers } from '@/lib/notifications';
import type { ComplaintStatus } from '@/lib/types';

export async function getMyComplaints() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', data: null };

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getAllComplaints() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('complaints')
    .select('*, user:users(name, email, house_number)')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function createComplaint(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Get user's house number
  const { data: profile } = await supabase
    .from('users')
    .select('house_number')
    .eq('id', user.id)
    .single();

  if (!profile?.house_number) return { error: 'House number not set' };

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;

  if (!title?.trim()) {
    return { error: 'Title is required' };
  }

  const { error } = await supabase.from('complaints').insert({
    user_id: user.id,
    house_number: profile.house_number,
    title: title.trim(),
    description: description?.trim() || null,
    image_url: image_url || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/complaints');
  revalidatePath('/admin/complaints');
  return { success: true };
}

export async function updateComplaintStatus(complaintId: string, status: ComplaintStatus) {
  const supabase = await createClient();

  // Get complaint details for notification
  const { data: complaint } = await supabase
    .from('complaints')
    .select('user_id, title')
    .eq('id', complaintId)
    .single();

  const { error } = await supabase
    .from('complaints')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', complaintId);

  if (error) return { error: error.message };

  // Notify the user who filed the complaint
  if (complaint) {
    await sendNotificationToUsers(
      [complaint.user_id],
      '🛠️ Complaint Update',
      `Your complaint "${complaint.title}" is now ${status.toLowerCase()}.`,
      { url: '/complaints' }
    );
  }

  revalidatePath('/complaints');
  revalidatePath('/admin/complaints');
  return { success: true };
}

export async function deleteComplaint(complaintId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('complaints')
    .delete()
    .eq('id', complaintId);

  if (error) return { error: error.message };

  revalidatePath('/complaints');
  revalidatePath('/admin/complaints');
  revalidatePath('/dashboard');
  return { success: true };
}
