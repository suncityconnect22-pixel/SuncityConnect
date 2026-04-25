import { getCurrentUser } from '@/actions/users';
import { getLatestNotice } from '@/actions/notices';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Header from '@/components/Header';
import Badge from '@/components/ui/Badge';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { data: latestNotice } = await getLatestNotice();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning (सुप्रभात)';
    if (hour < 17) return 'Good Afternoon (नमस्कार)';
    return 'Good Evening (शुभ संध्या)';
  };

  return (
    <>
      <Header title="Home (होम)" />
      <div className="px-4 py-4 space-y-5">
        {/* Greeting */}
        <div>
          <p className="text-sm text-gray-500">{greeting()}</p>
          <h2 className="text-xl font-bold text-gray-900 mt-0.5">
            {user.name} 👋
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            House: {user.house_number}
          </p>
        </div>

        {/* Latest Notice */}
        {latestNotice && (
          <Link href="/notices">
            <Card highlight={latestNotice.is_important} className="mt-2">
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">
                  {latestNotice.is_important ? '🔴' : '📢'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-400 uppercase">Latest Notice</span>
                    {latestNotice.is_important && (
                      <Badge variant="danger">Important</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate">{latestNotice.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{latestNotice.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            Quick Actions (त्वरित कार्य)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/complaints/new">
              <Card className="text-center py-6 hover:shadow-md transition-shadow">
                <span className="text-3xl mb-2 block">📝</span>
                <span className="text-sm font-semibold text-gray-800">Raise Complaint</span>
                <span className="text-xs text-gray-400 block">(शिकायत दर्ज करें)</span>
              </Card>
            </Link>

            <Link href="/visitors">
              <Card className="text-center py-6 hover:shadow-md transition-shadow">
                <span className="text-3xl mb-2 block">🚪</span>
                <span className="text-sm font-semibold text-gray-800">View Visitors</span>
                <span className="text-xs text-gray-400 block">(आगंतुक देखें)</span>
              </Card>
            </Link>

            <Link href="/notices">
              <Card className="text-center py-6 hover:shadow-md transition-shadow">
                <span className="text-3xl mb-2 block">📋</span>
                <span className="text-sm font-semibold text-gray-800">All Notices</span>
                <span className="text-xs text-gray-400 block">(सभी सूचनाएं)</span>
              </Card>
            </Link>

            <Link href="/staff">
              <Card className="text-center py-6 hover:shadow-md transition-shadow">
                <span className="text-3xl mb-2 block">👥</span>
                <span className="text-sm font-semibold text-gray-800">Staff Directory</span>
                <span className="text-xs text-gray-400 block">(कर्मचारी सूची)</span>
              </Card>
            </Link>
          </div>
        </div>

        {/* Admin/Super Admin quick link */}
        {(user.role === 'admin' || user.role === 'super_admin') && (
          <Link href="/admin">
            <Card className="bg-blue-600 text-white border-blue-600 mt-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h3 className="font-semibold">Admin Panel</h3>
                  <p className="text-blue-100 text-sm">Manage society settings</p>
                </div>
              </div>
            </Card>
          </Link>
        )}
      </div>
    </>
  );
}
