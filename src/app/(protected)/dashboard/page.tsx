'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '@/actions/users';
import { getLatestNotice } from '@/actions/notices';
import { getDashboardCounts } from '@/actions/dashboard';
import { getAllComplaints } from '@/actions/complaints';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Header from '@/components/Header';
import Badge from '@/components/ui/Badge';
import { COMPLAINT_STATUS_LABELS } from '@/lib/constants';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import type { User, Notice, ComplaintStatus } from '@/lib/types';

interface DashboardData {
  user: User | null;
  latestNotice: Notice | null;
  counts: {
    pendingComplaints: number;
    totalNotices: number;
    visitorsCount: number;
    pendingUsers: number;
  };
  recentComplaints: { id: string; title: string; status: string; house_number: string; created_at: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: latestNotice } = await getLatestNotice();
      const isAdmin = user.role === 'admin' || user.role === 'super_admin';
      const counts = await getDashboardCounts(isAdmin, user.house_number || '');

      let recentComplaints: DashboardData['recentComplaints'] = [];
      if (isAdmin) {
        const { data: complaintData } = await getAllComplaints();
        if (complaintData) recentComplaints = complaintData.slice(0, 5);
      }

      setData({
        user: user as User,
        latestNotice: latestNotice as Notice | null,
        counts,
        recentComplaints,
      });
    } catch {
      // silently fail on refresh
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Initial load
  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // Realtime sync for complaints, notices, visitors
  useRealtimeSync('complaints', loadDashboard);
  useRealtimeSync('notices', loadDashboard);
  useRealtimeSync('visitors', loadDashboard);

  if (loading || !data?.user) {
    return (
      <>
        <Header title="SuncityConnect" />
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  const { user, latestNotice, counts, recentComplaints } = data;
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return (
    <>
      <Header title="SuncityConnect" />
      <div className="px-4 py-4 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Greeting Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <p className="text-xs text-blue-200 font-semibold tracking-wide uppercase">
            {isAdmin ? (user.role === 'super_admin' ? '👑 Super Admin' : '⚙️ Admin') : 'Hello (नमस्ते)'}
          </p>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            {user.name} <span className="inline-block animate-wave">👋</span>
          </h2>
          <div className="mt-3 inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20">
            <span className="text-sm font-bold text-white/90">🏠 House: {user.house_number}</span>
          </div>
        </div>

        {isAdmin ? (
          /* ========== ADMIN DASHBOARD ========== */
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/complaints" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-4 rounded-2xl border-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent" />
                  <div className="relative">
                    <span className="text-3xl block mb-1">🔥</span>
                    <span className="text-2xl font-black text-gray-900 block">{counts.pendingComplaints}</span>
                    <span className="text-xs font-semibold text-gray-500">Open Complaints</span>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/visitors" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-4 rounded-2xl border-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent" />
                  <div className="relative">
                    <span className="text-3xl block mb-1">🚪</span>
                    <span className="text-2xl font-black text-gray-900 block">{counts.visitorsCount}</span>
                    <span className="text-xs font-semibold text-gray-500">Visitors Today</span>
                  </div>
                </Card>
              </Link>

              <Link href="/admin/notices" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-4 rounded-2xl border-gray-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent" />
                  <div className="relative">
                    <span className="text-3xl block mb-1">📢</span>
                    <span className="text-2xl font-black text-gray-900 block">{counts.totalNotices}</span>
                    <span className="text-xs font-semibold text-gray-500">Total Notices</span>
                  </div>
                </Card>
              </Link>

              {user.role === 'super_admin' ? (
                <Link href="/admin/users" className="block active:opacity-70 transition-opacity">
                  <Card className="text-center py-4 rounded-2xl border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent" />
                    <div className="relative">
                      <span className="text-3xl block mb-1">👥</span>
                      <span className="text-2xl font-black text-gray-900 block">{counts.pendingUsers}</span>
                      <span className="text-xs font-semibold text-gray-500">Pending Users</span>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Link href="/admin/staff" className="block active:opacity-70 transition-opacity">
                  <Card className="text-center py-4 rounded-2xl border-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent" />
                    <div className="relative">
                      <span className="text-3xl block mb-1">👥</span>
                      <span className="text-2xl font-black text-gray-900 block">Staff</span>
                      <span className="text-xs font-semibold text-gray-500">Manage Team</span>
                    </div>
                  </Card>
                </Link>
              )}
            </div>

            {/* Latest Notice — Enhanced */}
            {latestNotice && (
              <Link href="/admin/notices" className="block active:opacity-70 transition-opacity">
                <div className="notice-highlight-card rounded-2xl overflow-hidden border-2 relative"
                  style={{
                    borderColor: latestNotice.is_important ? '#f87171' : '#60a5fa',
                    background: latestNotice.is_important
                      ? 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 50%, #ffe4e6 100%)'
                      : 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #dbeafe 100%)',
                    boxShadow: latestNotice.is_important
                      ? '0 4px 24px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(239, 68, 68, 0.08)'
                      : '0 4px 24px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(59, 130, 246, 0.08)',
                  }}
                >
                  {/* Top animated accent bar */}
                  <div
                    className="h-1.5"
                    style={{
                      background: latestNotice.is_important
                        ? 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)'
                        : 'linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`text-xl shrink-0 p-2.5 rounded-xl ${latestNotice.is_important ? 'bg-red-100' : 'bg-blue-100'}`}
                        style={{ animation: 'noticePulse 2s ease-in-out infinite' }}
                      >
                        {latestNotice.is_important ? '🚨' : '📢'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${latestNotice.is_important ? 'text-red-600' : 'text-blue-600'}`}>
                            {latestNotice.is_important ? '⚠️ Important Notice' : 'Latest Notice'}
                          </span>
                          {latestNotice.is_important && <Badge variant="danger">Important</Badge>}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mt-0.5 line-clamp-2">{latestNotice.title}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Recent Complaints Overview */}
            {recentComplaints.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent Complaints</h3>
                  <Link href="/admin/complaints" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentComplaints.map((c) => (
                    <Link key={c.id} href="/admin/complaints" className="block">
                      <Card className="rounded-xl !p-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${
                            c.status === 'open' ? 'bg-red-500' : c.status === 'in_progress' ? 'bg-orange-500' : 'bg-green-500'
                          }`} />
                          <span className="text-sm font-medium text-gray-800 truncate flex-1">{c.title}</span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                            {c.house_number}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Admin Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/staff" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-4 rounded-2xl border-gray-100">
                  <span className="text-2xl block mb-1">👷</span>
                  <span className="text-xs font-bold text-gray-700">Manage Staff</span>
                </Card>
              </Link>
              <Link href="/staff" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-4 rounded-2xl border-gray-100">
                  <span className="text-2xl block mb-1">📞</span>
                  <span className="text-xs font-bold text-gray-700">Staff Directory</span>
                </Card>
              </Link>
            </div>
          </>
        ) : (
          /* ========== REGULAR USER DASHBOARD ========== */
          <>
            {/* Latest Notice — Enhanced for Users */}
            {latestNotice && (
              <Link href="/notices" className="block active:opacity-70 transition-opacity">
                <div className="notice-highlight-card rounded-2xl overflow-hidden border-2 relative"
                  style={{
                    borderColor: latestNotice.is_important ? '#f87171' : '#60a5fa',
                    background: latestNotice.is_important
                      ? 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 50%, #ffe4e6 100%)'
                      : 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #dbeafe 100%)',
                    boxShadow: latestNotice.is_important
                      ? '0 4px 24px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(239, 68, 68, 0.08)'
                      : '0 4px 24px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(59, 130, 246, 0.08)',
                  }}
                >
                  {/* Top animated accent bar */}
                  <div
                    className="h-1.5"
                    style={{
                      background: latestNotice.is_important
                        ? 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)'
                        : 'linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s linear infinite',
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`text-2xl shrink-0 p-3 rounded-xl ${latestNotice.is_important ? 'bg-red-100' : 'bg-blue-100'}`}
                        style={{ animation: 'noticePulse 2s ease-in-out infinite' }}
                      >
                        {latestNotice.is_important ? '🚨' : '📢'}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider ${latestNotice.is_important ? 'text-red-600' : 'text-blue-600'}`}>
                            {latestNotice.is_important ? '⚠️ Important Notice' : 'Latest Notice'}
                          </span>
                          {latestNotice.is_important && <Badge variant="danger">Important</Badge>}
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mt-0.5 line-clamp-2">{latestNotice.title}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/complaints" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-5 hover:bg-gray-50 border-gray-100 rounded-2xl relative">
                  <span className="text-3xl mb-2 block">📝</span>
                  <span className="text-sm font-bold text-gray-800">My Complaints</span>
                  {counts.pendingComplaints > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      {counts.pendingComplaints}
                    </span>
                  )}
                </Card>
              </Link>

              <Link href="/visitors" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-5 hover:bg-gray-50 border-gray-100 rounded-2xl relative">
                  <span className="text-3xl mb-2 block">🚪</span>
                  <span className="text-sm font-bold text-gray-800">Visitors Log</span>
                  {counts.visitorsCount > 0 && (
                    <span className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                      {counts.visitorsCount}
                    </span>
                  )}
                </Card>
              </Link>

              <Link href="/notices" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-5 hover:bg-gray-50 border-gray-100 rounded-2xl relative">
                  <span className="text-3xl mb-2 block">📋</span>
                  <span className="text-sm font-bold text-gray-800">All Notices</span>
                  {counts.totalNotices > 0 && (
                    <span className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gray-200">
                      {counts.totalNotices}
                    </span>
                  )}
                </Card>
              </Link>

              <Link href="/staff" className="block active:opacity-70 transition-opacity">
                <Card className="text-center py-5 hover:bg-gray-50 border-gray-100 rounded-2xl">
                  <span className="text-3xl mb-2 block">👥</span>
                  <span className="text-sm font-bold text-gray-800">Staff List</span>
                </Card>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
