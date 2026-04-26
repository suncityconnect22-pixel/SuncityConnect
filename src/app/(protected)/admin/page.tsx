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
      title: 'Manage Notices (सूचनाएं)',
      description: 'Create, edit, delete notices',
      count: counts.totalNotices,
      countLabel: 'Total',
    },
    {
      href: '/admin/complaints',
      icon: '📝',
      title: 'Manage Complaints (शिकायतें)',
      description: 'View and update complaint status',
      count: counts.pendingComplaints,
      countLabel: 'Pending',
    },
    {
      href: '/admin/staff',
      icon: '👥',
      title: 'Manage Staff (कर्मचारी)',
      description: 'Add, edit, remove staff members',
      count: 0,
      countLabel: '',
    },
    {
      href: '/admin/visitors',
      icon: '🚪',
      title: 'Visitor Log (आगंतुक)',
      description: 'View all society visitors',
      count: counts.visitorsCount,
      countLabel: 'Today',
    },
  ];

  // Super admin only
  if (user.role === 'super_admin') {
    adminLinks.push({
      href: '/admin/users',
      icon: '🔐',
      title: 'User Management (उपयोगकर्ता)',
      description: 'Approve users, manage roles & payments',
      count: counts.pendingUsers,
      countLabel: 'Pending',
    });
  }

  return (
    <>
      <Header title="Admin Panel (एडमिन)" showBack />
      <div className="px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 pointer-events-none">🛡️</div>
          <p className="text-sm text-blue-800 font-medium">
            Logged in as <span className="font-bold bg-white/60 px-2 py-0.5 rounded shadow-sm ml-1">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
          </p>
        </div>

        <div className="grid gap-3">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card className="hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-3xl shrink-0 bg-gray-50 w-12 h-12 flex items-center justify-center rounded-xl group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{link.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{link.description}</p>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {link.count > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        {link.count} {link.countLabel}
                      </span>
                    )}
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
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
