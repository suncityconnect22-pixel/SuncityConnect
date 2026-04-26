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
      <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-lg mx-auto">
        {/* Greeting Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-100/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none">✨</div>
          <p className="text-sm text-blue-600/80 font-semibold tracking-wide uppercase">Hello (नमस्ते)</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-1 drop-shadow-sm">
            {user.name} <span className="inline-block animate-wave">👋</span>
          </h2>
          <div className="mt-3 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
            <span className="text-blue-500 text-lg">🏠</span>
            <span className="text-sm font-bold text-gray-700">
              House: {user.house_number}
            </span>
          </div>
        </div>

        {/* Latest Notice */}
        {latestNotice && (
          <Link href="/notices" className="block transform transition-transform hover:-translate-y-1 active:translate-y-0">
            <Card highlight={latestNotice.is_important} className="shadow-md hover:shadow-lg transition-all duration-300 bg-white border border-gray-100 rounded-2xl overflow-hidden relative">
              {latestNotice.is_important && (
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              )}
              <div className="flex items-start gap-4 p-1">
                <div className={`text-3xl shrink-0 p-3 rounded-2xl ${latestNotice.is_important ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                  {latestNotice.is_important ? '🔴' : '📢'}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Latest Notice</span>
                    {latestNotice.is_important && (
                      <Badge variant="danger" className="animate-pulse">Important</Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 truncate text-lg leading-tight">{latestNotice.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{latestNotice.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-1">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/complaints">
              <Card className="text-center py-7 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform duration-300">📝</span>
                  <span className="text-sm font-bold text-gray-800">My Complaints</span>
                  <span className="text-[10px] text-gray-400 block mt-1 font-medium">(मेरी शिकायतें)</span>
                  {counts.pendingComplaints > 0 && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {counts.pendingComplaints} Pending
                    </span>
                  )}
                </div>
              </Card>
            </Link>

            <Link href="/visitors">
              <Card className="text-center py-7 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform duration-300">🚪</span>
                  <span className="text-sm font-bold text-gray-800">Visitors Log</span>
                  <span className="text-[10px] text-gray-400 block mt-1 font-medium">(आगंतुक)</span>
                  {counts.visitorsCount > 0 && (
                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {counts.visitorsCount} Today
                    </span>
                  )}
                </div>
              </Card>
            </Link>

            <Link href="/notices">
              <Card className="text-center py-7 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform duration-300">📋</span>
                  <span className="text-sm font-bold text-gray-800">All Notices</span>
                  <span className="text-[10px] text-gray-400 block mt-1 font-medium">(सभी सूचनाएं)</span>
                  {counts.totalNotices > 0 && (
                    <span className="absolute top-3 right-3 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                      {counts.totalNotices} Total
                    </span>
                  )}
                </div>
              </Card>
            </Link>

            <Link href="/staff">
              <Card className="text-center py-7 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform duration-300">👥</span>
                  <span className="text-sm font-bold text-gray-800">Staff Directory</span>
                  <span className="text-[10px] text-gray-400 block mt-1 font-medium">(कर्मचारी सूची)</span>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Admin/Super Admin quick link */}
        {isAdmin && (
          <Link href="/admin" className="block pt-2">
            <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4 relative z-10 p-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  ⚙️
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Admin Control Panel</h3>
                  <p className="text-slate-300 text-xs mt-0.5">Manage users, notices, and settings</p>
                </div>
                <div className="shrink-0 bg-white/10 p-2 rounded-full">
                  <svg className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        )}
      </div>
    </>
  );
}
