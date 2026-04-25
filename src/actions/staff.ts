// ============================================================
// Staff Server Actions
// ============================================================
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getStaff() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('name', { ascending: true });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function createStaff(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string;

  if (!name?.trim() || !role?.trim()) {
    return { error: 'Name and role are required' };
  }

  const { error } = await supabase.from('staff').insert({
    name: name.trim(),
    role: role.trim(),
    phone: phone?.trim() || null,
    created_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath('/staff');
  revalidatePath('/admin/staff');
  return { success: true };
}

export async function updateStaff(staffId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const phone = formData.get('phone') as string;

  const { error } = await supabase
    .from('staff')
    .update({
      name: name.trim(),
      role: role.trim(),
      phone: phone?.trim() || null,
    })
    .eq('id', staffId);

  if (error) return { error: error.message };

  revalidatePath('/staff');
  revalidatePath('/admin/staff');
  return { success: true };
}

export async function deleteStaff(staffId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', staffId);

  if (error) return { error: error.message };

  revalidatePath('/staff');
  revalidatePath('/admin/staff');
  return { success: true };
}
