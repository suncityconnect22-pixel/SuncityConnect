import { getCurrentUser } from '@/actions/users';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import type { UserRole } from '@/lib/types';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) redirect('/login');
  if (!user.is_approved) redirect('/waiting-approval');

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full">
      <main className="flex-1 pb-safe page-enter">
        {children}
      </main>
      <BottomNav role={user.role as UserRole} />
    </div>
  );
}
