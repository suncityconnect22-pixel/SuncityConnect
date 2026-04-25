import { getMyComplaints } from '@/actions/complaints';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import ImageWithModal from '@/components/ui/ImageWithModal';
import Link from 'next/link';
import { COMPLAINT_STATUS_LABELS } from '@/lib/constants';
import type { ComplaintStatus } from '@/lib/types';

const statusVariant = (status: ComplaintStatus) => {
  switch (status) {
    case 'open': return 'danger' as const;
    case 'in_progress': return 'warning' as const;
    case 'resolved': return 'success' as const;
  }
};

export default async function ComplaintsPage() {
  const { data: complaints } = await getMyComplaints();

  return (
    <>
      <Header
        title="Complaints (शिकायतें)"
        action={
          <Link href="/complaints/new">
            <Button size="sm">+ New</Button>
          </Link>
        }
      />
      <div className="px-4 py-4">
        {!complaints || complaints.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No Complaints"
            description="You haven't raised any complaints yet."
            action={
              <Link href="/complaints/new">
                <Button>Raise Complaint (शिकायत दर्ज करें)</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <Card key={complaint.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{complaint.title}</h3>
                    {complaint.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={statusVariant(complaint.status as ComplaintStatus)}>
                        {COMPLAINT_STATUS_LABELS[complaint.status]}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                  {complaint.image_url && (
                    <ImageWithModal
                      src={complaint.image_url}
                      alt="Complaint"
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
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
