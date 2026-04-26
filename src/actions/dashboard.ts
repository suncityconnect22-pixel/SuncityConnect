'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardCounts(isAdmin = false, houseNumber = '') {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let pendingComplaints = 0;
  let totalNotices = 0;
  let visitorsCount = 0; // Today for admin, all for user (or just all for user?)
  let pendingUsers = 0;

  // Complaints
  if (isAdmin) {
    const { count } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    pendingComplaints = count || 0;
  } else if (houseNumber) {
    const { count } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('house_number', houseNumber)
      .eq('status', 'pending');
    pendingComplaints = count || 0;
  }

  // Notices (Everyone sees total notices)
  const { count: noticesCount } = await supabase
    .from('notices')
    .select('*', { count: 'exact', head: true });
  totalNotices = noticesCount || 0;

  // Visitors
  if (isAdmin) {
    const { count } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .gte('entry_time', today.toISOString());
    visitorsCount = count || 0;
  } else if (houseNumber) {
    // For users, maybe just show total visitors for their house
    const { count } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true })
      .eq('house_number', houseNumber);
    visitorsCount = count || 0;
  }

  // Users (Admin only)
  if (isAdmin) {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', false);
    pendingUsers = count || 0;
  }

  return {
    pendingComplaints,
    totalNotices,
    visitorsCount,
    pendingUsers
  };
}
