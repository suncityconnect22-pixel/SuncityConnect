import { getCurrentUser } from '@/actions/users';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin' && user.role !== 'super_admin') redirect('/dashboard');

  const adminLinks = [
    {
      href: '/admin/notices',
      icon: '📢',
      title: 'Manage Notices (सूचनाएं)',
      description: 'Create, edit, delete notices',
    },
    {
      href: '/admin/complaints',
      icon: '📝',
      title: 'Manage Complaints (शिकायतें)',
      description: 'View and update complaint status',
    },
    {
      href: '/admin/staff',
      icon: '👥',
      title: 'Manage Staff (कर्मचारी)',
      description: 'Add, edit, remove staff members',
    },
    {
      href: '/admin/visitors',
      icon: '🚪',
      title: 'Visitor Log (आगंतुक)',
      description: 'View all society visitors',
    },
  ];

  // Super admin only
  if (user.role === 'super_admin') {
    adminLinks.push({
      href: '/admin/users',
      icon: '🔐',
      title: 'User Management (उपयोगकर्ता)',
      description: 'Approve users, manage roles & payments',
    });
  }

  return (
    <>
      <Header title="Admin Panel (एडमिन)" />
      <div className="px-4 py-4 space-y-3">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2">
          <p className="text-sm text-blue-800">
            Logged in as <span className="font-bold">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
          </p>
        </div>

        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-3xl shrink-0">{link.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{link.title}</h3>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
