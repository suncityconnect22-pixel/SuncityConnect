import { getCurrentUser } from '@/actions/users';
import { getDashboardCounts } from '@/actions/dashboard';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin' && user.role !== 'super_admin') redirect('/dashboard');

  const counts = await getDashboardCounts(true);

  const adminLinks = [
    {
      href: '/admin/notices',
      icon: '📢',
      title: 'Manage Notices',
      count: counts.totalNotices,
      countLabel: 'Total',
    },
    {
      href: '/admin/complaints',
      icon: '📝',
      title: 'Manage Complaints',
      count: counts.pendingComplaints,
      countLabel: 'Pending',
    },
    {
      href: '/admin/staff',
      icon: '👥',
      title: 'Manage Staff',
      count: 0,
      countLabel: '',
    },
    {
      href: '/admin/visitors',
      icon: '🚪',
      title: 'Visitor Log',
      count: counts.visitorsCount,
      countLabel: 'Today',
    },
  ];

  if (user.role === 'super_admin') {
    adminLinks.push({
      href: '/admin/users',
      icon: '🔐',
      title: 'User Management',
      count: counts.pendingUsers,
      countLabel: 'Pending',
    });
  }

  return (
    <>
      <Header title="Admin Panel" showBack />
      <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-xs text-blue-800 font-medium">
            Logged in as <span className="font-bold">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
          </p>
        </div>

        <div className="grid gap-3">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block active:opacity-70 transition-opacity">
              <Card className="hover:bg-gray-50 border-gray-100 rounded-xl relative">
                <div className="flex items-center gap-4">
                  <div className="text-2xl shrink-0 bg-gray-50 w-10 h-10 flex items-center justify-center rounded-lg">
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm">{link.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {link.count > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                        {link.count} {link.countLabel}
                      </span>
                    )}
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
