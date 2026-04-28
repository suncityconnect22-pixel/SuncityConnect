// ============================================================
// User Server Actions
// ============================================================
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendNotificationToUsers } from '@/lib/notifications';
import type { UserRole, PaymentStatus } from '@/lib/types';

// Get current user profile
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Update user profile (onboarding)
export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Not authenticated' };

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const house_number = formData.get('house_number') as string;

  if (!name?.trim() || !house_number?.trim()) {
    return { error: 'Name and house number are required' };
  }

  const { error } = await supabase
    .from('users')
    .update({
      name: name.trim(),
      phone: phone?.trim() || null,
      house_number: house_number.trim().toUpperCase(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/');
  return { success: true };
}

// Super admin: Get all users
export async function getAllUsers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

// Super admin: Get pending users
export async function getPendingUsers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

// Super admin: Approve user
export async function approveUser(userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .update({ is_approved: true, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: error.message };

  // Notify the user
  await sendNotificationToUsers(
    [userId],
    '🎉 Account Approved',
    'Your account has been approved. You can now access all features.',
    { url: '/dashboard' }
  );
  
  revalidatePath('/admin/users');
  return { success: true };
}

// Super admin: Reject (delete) user
export async function rejectUser(userId: string) {
  const supabase = await createClient();
  
  // Delete from users table (cascade will handle auth.users if set up)
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) return { error: error.message };
  
  revalidatePath('/admin/users');
  return { success: true };
}

// Super admin: Update user role
export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: error.message };
  
  revalidatePath('/admin/users');
  return { success: true };
}

// Super admin: Update payment status
export async function updatePaymentStatus(userId: string, status: PaymentStatus) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('users')
    .update({ payment_status: status, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) return { error: error.message };
  
  revalidatePath('/admin/users');
  return { success: true };
}

// Super admin: Delete user (remove completely)
export async function deleteUser(userId: string) {
  const supabase = await createClient();
  
  // Delete from users table
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) return { error: error.message };
  
  revalidatePath('/admin/users');
  revalidatePath('/dashboard');
  return { success: true };
}
