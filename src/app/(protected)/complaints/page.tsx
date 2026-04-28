'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMyComplaints } from '@/actions/complaints';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageWithModal from '@/components/ui/ImageWithModal';
import Link from 'next/link';
import { COMPLAINT_STATUS_LABELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';
import type { ComplaintStatus, Complaint } from '@/lib/types';

const statusVariant = (status: ComplaintStatus) => {
  switch (status) {
    case 'open': return 'danger' as const;
    case 'in_progress': return 'warning' as const;
    case 'resolved': return 'success' as const;
  }
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const loadComplaints = useCallback(async () => {
    const result = await getMyComplaints();
    if (result.data) setComplaints(result.data as Complaint[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadComplaints();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('realtime:my_complaints')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
        },
        () => {
          // Simplest way: just reload all complaints when any change happens
          // (Since this is 'my' complaints, RLS will ensure we only see ours)
          loadComplaints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadComplaints]);

  if (loading) {
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
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

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
        {complaints.length === 0 ? (
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
              <div key={complaint.id} onClick={() => setSelectedComplaint(complaint)} className="cursor-pointer">
                <Card>
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
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0" onClick={(e) => e.stopPropagation()}>
                        <ImageWithModal
                          src={complaint.image_url}
                          alt="Complaint"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          title="Complaint Details"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selectedComplaint.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={statusVariant(selectedComplaint.status as ComplaintStatus)}>
                  {COMPLAINT_STATUS_LABELS[selectedComplaint.status]}
                </Badge>
                <span className="text-xs text-gray-400">
                  {new Date(selectedComplaint.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {selectedComplaint.description && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>
            )}

            {selectedComplaint.image_url && (
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <img
                  src={selectedComplaint.image_url}
                  alt="Complaint"
                  className="w-full max-h-80 object-contain bg-gray-50"
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
