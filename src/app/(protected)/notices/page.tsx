import { getNotices } from '@/actions/notices';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

export default async function NoticesPage() {
  const { data: notices } = await getNotices();

  return (
    <>
      <Header title="Notices (सूचनाएं)" />
      <div className="px-4 py-4">
        {!notices || notices.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No Notices Yet"
            description="There are no notices at the moment. Check back later!"
          />
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <Card key={notice.id} highlight={notice.is_important}>
                <div className="flex items-start gap-3">
                  <div className="text-xl shrink-0 mt-0.5">
                    {notice.is_important ? '🔴' : '📢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notice.is_important && (
                        <Badge variant="danger">Important (महत्वपूर्ण)</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                    <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap">{notice.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notice.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
