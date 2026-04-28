import { getMyVisitors } from '@/actions/visitors';
import { getCurrentUser } from '@/actions/users';
import Header from '@/components/Header';
import VisitorList from '@/components/VisitorList';
import { redirect } from 'next/navigation';

export default async function VisitorsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { data: visitors } = await getMyVisitors();

  return (
    <>
      <Header title="Visitors (आगंतुक)" showBack />
      <div className="px-4 py-4">
        <VisitorList 
          initialVisitors={visitors || []} 
          houseNumber={user.house_number || ''} 
        />
      </div>
    </>
  );
}
