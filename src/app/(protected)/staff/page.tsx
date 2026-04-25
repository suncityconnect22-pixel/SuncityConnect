import { getStaff } from '@/actions/staff';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

export default async function StaffPage() {
  const { data: staff } = await getStaff();

  return (
    <>
      <Header title="Staff (कर्मचारी)" showBack />
      <div className="px-4 py-4">
        {!staff || staff.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No Staff Listed"
            description="Staff directory will be updated by the admin."
          />
        ) : (
          <div className="space-y-3">
            {staff.map((member) => (
              <Card key={member.id}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg">👷</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="shrink-0 p-2 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors tap-target"
                      aria-label={`Call ${member.name}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
