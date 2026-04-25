import { getMyVisitors } from '@/actions/visitors';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { VISITOR_TYPE_LABELS, VISITOR_TYPE_ICONS } from '@/lib/constants';

export default async function VisitorsPage() {
  const { data: visitors } = await getMyVisitors();

  return (
    <>
      <Header title="Visitors (आगंतुक)" showBack />
      <div className="px-4 py-4">
        {!visitors || visitors.length === 0 ? (
          <EmptyState
            icon="🚪"
            title="No Visitors Yet"
            description="No visitors have been recorded for your house."
          />
        ) : (
          <div className="space-y-3">
            {visitors.map((visitor) => (
              <Card key={visitor.id}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl shrink-0">
                    {VISITOR_TYPE_ICONS[visitor.visitor_type] || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {visitor.name || 'Unknown Visitor'}
                      </h3>
                      <Badge variant="info">
                        {VISITOR_TYPE_LABELS[visitor.visitor_type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>
                        In: {new Date(visitor.entry_time).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {visitor.exit_time ? (
                        <span className="text-green-600">
                          Out: {new Date(visitor.exit_time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span className="text-orange-500 font-medium">Still Inside</span>
                      )}
                    </div>
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
