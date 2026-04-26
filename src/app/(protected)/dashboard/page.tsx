import { getCurrentUser } from '@/actions/users';
import { getLatestNotice } from '@/actions/notices';
import { getDashboardCounts } from '@/actions/dashboard';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Header from '@/components/Header';
import Badge from '@/components/ui/Badge';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { data: latestNotice } = await getLatestNotice();
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const counts = await getDashboardCounts(isAdmin, user.house_number || '');

  return (
    <>
      <Header title="SuncityConnect" />
      <div className="px-4 py-4 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Greeting Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none">✨</div>
          <p className="text-xs text-blue-600 font-semibold tracking-wide uppercase">Hello (नमस्ते)</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-0.5">
            {user.name} <span className="inline-block animate-wave">👋</span>
          </h2>
          <div className="mt-2 inline-flex items-center gap-2 bg-white/80 px-2.5 py-1 rounded-lg border border-blue-100 shadow-sm">
            <span className="text-sm font-bold text-gray-700">House: {user.house_number}</span>
          </div>
        </div>

        {/* Latest Notice */}
        {latestNotice && (
          <Link href="/notices" className="block active:opacity-70 transition-opacity">
            <Card highlight={latestNotice.is_important} className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
              <div className="flex items-start gap-4 p-1">
                <div className={`text-2xl shrink-0 p-3 rounded-xl ${latestNotice.is_important ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                  {latestNotice.is_important ? '🔴' : '📢'}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Latest Notice</span>
                    {latestNotice.is_important && <Badge variant="danger">Important</Badge>}
                  </div>
                  <h3 className="font-bold text-gray-900 truncate text-base">{latestNotice.title}</h3>
                </div>
              </div>
            </Card>
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

        {/* Admin Link */}
        {isAdmin && (
          <Link href="/admin" className="block active:opacity-70 transition-opacity">
            <Card className="bg-slate-900 text-white border-transparent rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shrink-0">⚙️</div>
                <div className="flex-1">
                  <h3 className="font-bold">Admin Panel</h3>
                  <p className="text-slate-400 text-[10px]">Manage users & settings</p>
                </div>
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>
        )}
      </div>
    </>
  );
}
