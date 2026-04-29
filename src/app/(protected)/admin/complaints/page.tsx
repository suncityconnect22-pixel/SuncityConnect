'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllComplaints, updateComplaintStatus, deleteComplaint } from '@/actions/complaints';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import ImageWithModal from '@/components/ui/ImageWithModal';
import { COMPLAINT_STATUS_LABELS } from '@/lib/constants';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import type { ComplaintStatus } from '@/lib/types';

interface ComplaintWithUser {
  id: string;
  user_id: string;
  house_number: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  created_at: string;
  user: { name: string; email: string; house_number: string } | null;
}

const statusOrder: ComplaintStatus[] = ['open', 'in_progress', 'resolved'];

const statusVariant = (status: string) => {
  switch (status) {
    case 'open': return 'danger' as const;
    case 'in_progress': return 'warning' as const;
    case 'resolved': return 'success' as const;
    default: return 'info' as const;
  }
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithUser | null>(null);

  const loadComplaints = useCallback(async () => {
    const result = await getAllComplaints();
    if (result.data) setComplaints(result.data as ComplaintWithUser[]);
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => { loadComplaints(); }, [loadComplaints]);

  // Realtime + polling
  useRealtimeSync('complaints', loadComplaints);

  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    const result = await updateComplaintStatus(id, newStatus);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: `Status updated to ${COMPLAINT_STATUS_LABELS[newStatus]}`, type: 'success' });
      await loadComplaints();
      // Update the selected complaint if it's the one we changed
      if (selectedComplaint?.id === id) {
        setSelectedComplaint(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this complaint?')) return;
    
    const result = await deleteComplaint(id);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Complaint deleted permanently', type: 'success' });
      setComplaints(prev => prev.filter(c => c.id !== id));
      if (selectedComplaint?.id === id) setSelectedComplaint(null);
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <>
      <Header title="Manage Complaints" showBack />

      <div className="px-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {['all', 'open', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-sm ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {s === 'all' ? `All (${complaints.length})` : `${COMPLAINT_STATUS_LABELS[s as ComplaintStatus]} (${complaints.filter((c) => c.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-2">✅</span>
            <p className="text-gray-500">No complaints in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((complaint) => (
              <div key={complaint.id} onClick={() => setSelectedComplaint(complaint)} className="cursor-pointer">
                <Card className="border-l-4 border-l-blue-500">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900">{complaint.title}</h3>
                        {complaint.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
                        )}
                      </div>
                      {complaint.image_url && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0" onClick={(e) => e.stopPropagation()}>
                          <ImageWithModal src={complaint.image_url} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant={statusVariant(complaint.status)}>
                        {COMPLAINT_STATUS_LABELS[complaint.status]}
                      </Badge>
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">🏠 {complaint.house_number}</span>
                      <span className="text-gray-400">{complaint.user?.name || 'Unknown'}</span>
                      <span className="text-gray-400">• {new Date(complaint.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
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
            {/* Title & Meta */}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{selectedComplaint.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={statusVariant(selectedComplaint.status)}>
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

            {/* User Info */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 text-sm">
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">🏠 {selectedComplaint.house_number}</span>
              <span className="text-gray-700 font-medium">{selectedComplaint.user?.name || 'Unknown User'}</span>
            </div>

            {/* Full Description */}
            {selectedComplaint.description && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>
            )}

            {/* Image */}
            {selectedComplaint.image_url && (
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <img
                  src={selectedComplaint.image_url}
                  alt="Complaint"
                  className="w-full max-h-80 object-contain bg-gray-50"
                />
              </div>
            )}

            {/* Status Controls */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Change Status</p>
              <div className="flex gap-1.5">
                {statusOrder.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedComplaint.id, s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedComplaint.status === s
                        ? s === 'open' ? 'bg-red-600 text-white shadow-md'
                          : s === 'in_progress' ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {s === 'open' ? 'Open' : s === 'in_progress' ? 'In Progress' : 'Resolved'}
                  </button>
                ))}
              </div>
            </div>

            {/* Delete Button */}
            <Button
              variant="danger"
              fullWidth
              onClick={() => handleDelete(selectedComplaint.id)}
            >
              🗑️ Delete Permanently
            </Button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
