import { getCurrentUser } from '@/actions/users';
import { signOut } from '@/actions/auth';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import NotificationToggle from '@/components/NotificationToggle';
import { ROLE_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <>
      <Header title="Profile (प्रोफ़ाइल)" />
      <div className="px-4 py-4 space-y-4">
        {/* User Info Card */}
        <Card>
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">
                {user.role === 'guard' ? '🛡️' : user.role === 'admin' || user.role === 'super_admin' ? '👑' : '🏠'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="info">{ROLE_LABELS[user.role]}</Badge>
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">House Number (मकान नंबर)</span>
              <span className="font-semibold text-gray-900">{user.house_number || '-'}</span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Phone (फोन)</span>
              <span className="font-semibold text-gray-900">{user.phone || '-'}</span>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Payment (भुगतान)</span>
              <Badge variant={user.payment_status === 'paid' ? 'success' : 'warning'}>
                {PAYMENT_STATUS_LABELS[user.payment_status]}
              </Badge>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Member Since</span>
              <span className="text-sm text-gray-700">
                {new Date(user.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="border-t border-gray-100" />
            <NotificationToggle />
          </div>
        </Card>

        {/* Logout */}
        <form action={signOut}>
          <Button type="submit" variant="danger" fullWidth size="lg">
            Logout (लॉगआउट)
          </Button>
        </form>
      </div>
    </>
  );
}
