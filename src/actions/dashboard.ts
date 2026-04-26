'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardCounts(isAdmin = false, houseNumber = '') {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const queries = [];

  // 1. Complaints
  if (isAdmin) {
    queries.push(
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
    );
  } else if (houseNumber) {
    queries.push(
      supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('house_number', houseNumber)
        .eq('status', 'pending')
    );
  } else {
    queries.push(Promise.resolve({ count: 0 }));
  }

  // 2. Notices
  queries.push(
    supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })
  );

  // 3. Visitors
  if (isAdmin) {
    queries.push(
      supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .gte('entry_time', today.toISOString())
    );
  } else if (houseNumber) {
    queries.push(
      supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .eq('house_number', houseNumber)
    );
  } else {
    queries.push(Promise.resolve({ count: 0 }));
  }

  // 4. Users (Admin only)
  if (isAdmin) {
    queries.push(
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
    );
  } else {
    queries.push(Promise.resolve({ count: 0 }));
  }

  const results = await Promise.all(queries);

  return {
    pendingComplaints: results[0].count || 0,
    totalNotices: results[1].count || 0,
    visitorsCount: results[2].count || 0,
    pendingUsers: results[3].count || 0
  };
}
