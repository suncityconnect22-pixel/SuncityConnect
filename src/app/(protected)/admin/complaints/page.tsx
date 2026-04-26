'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllComplaints, updateComplaintStatus, deleteComplaint } from '@/actions/complaints';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import ImageWithModal from '@/components/ui/ImageWithModal';
import { COMPLAINT_STATUS_LABELS } from '@/lib/constants';
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

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadComplaints = useCallback(async () => {
    const result = await getAllComplaints();
    if (result.data) setComplaints(result.data as ComplaintWithUser[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadComplaints(); }, [loadComplaints]);

  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    const result = await updateComplaintStatus(id, newStatus);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: `Status updated to ${COMPLAINT_STATUS_LABELS[newStatus]}`, type: 'success' });
      await loadComplaints();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this complaint?')) return;
    
    setLoading(true);
    const result = await deleteComplaint(id);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
      setLoading(false);
    } else {
      setToast({ message: 'Complaint deleted permanently', type: 'success' });
      await loadComplaints();
    }
  };

  const filtered = filter === 'all' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <>
      <Header title="Manage Complaints" showBack />

      <div className="px-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
          <div className="space-y-4">
            {filtered.map((complaint) => (
              <Card key={complaint.id} className="border-l-4 border-l-blue-500">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg">{complaint.title}</h3>
                      {complaint.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
                      )}
                    </div>
                    {complaint.image_url && (
                      <ImageWithModal src={complaint.image_url} className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-sm border border-gray-100" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <span className="font-semibold text-gray-700 bg-white px-2 py-1 rounded shadow-sm">🏠 {complaint.house_number}</span>
                    <span className="font-medium text-gray-600">{complaint.user?.name || 'Unknown'}</span>
                    <span className="text-gray-400">• {new Date(complaint.created_at).toLocaleDateString('en-IN')}</span>
                  </div>

                  {/* Status buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1">Status:</span>
                    <div className="flex gap-1.5 w-full">
                      {statusOrder.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(complaint.id, s)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            complaint.status === s
                              ? s === 'open' ? 'bg-red-600 text-white shadow-md' 
                                : s === 'in_progress' ? 'bg-orange-500 text-white shadow-md' 
                                : 'bg-green-600 text-white shadow-md'
                              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {s === 'open' ? 'Open' : s === 'in_progress' ? 'In Progress' : 'Resolved'}
                        </button>
                      ))}
                      <button
                        onClick={() => handleDelete(complaint.id)}
                        className="py-1.5 px-3 rounded-lg text-xs font-bold transition-all bg-white text-red-500 hover:bg-red-50 border border-red-200 shadow-sm"
                        title="Delete Permanently"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
