'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, approveUser, rejectUser, updateUserRole, updatePaymentStatus } from '@/actions/users';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import { ROLE_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import type { User, UserRole, PaymentStatus } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    const r = await getAllUsers();
    if (r.data) setUsers(r.data as User[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    const r = await approveUser(id);
    if (r.error) setToast({ message: r.error, type: 'error' });
    else { setToast({ message: 'User approved ✅', type: 'success' }); await load(); }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject and remove this user?')) return;
    const r = await rejectUser(id);
    if (r.error) setToast({ message: r.error, type: 'error' });
    else { setToast({ message: 'User rejected', type: 'success' }); await load(); }
  };

  const handleRoleChange = async (id: string, role: UserRole) => {
    const r = await updateUserRole(id, role);
    if (r.error) setToast({ message: r.error, type: 'error' });
    else { setToast({ message: 'Role updated', type: 'success' }); await load(); }
  };

  const handlePayment = async (id: string, status: PaymentStatus) => {
    const r = await updatePaymentStatus(id, status);
    if (r.error) setToast({ message: r.error, type: 'error' });
    else { setToast({ message: 'Payment status updated', type: 'success' }); await load(); }
  };

  const filtered = filter === 'all' ? users
    : filter === 'pending' ? users.filter((u) => !u.is_approved)
    : users.filter((u) => u.is_approved);

  const pendingCount = users.filter((u) => !u.is_approved).length;

  return (
    <>
      <Header title="User Management" showBack />
      <div className="px-4 py-4">
        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f === 'pending' ? `Pending (${pendingCount})` : f === 'approved' ? 'Approved' : 'All'}
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
            <p className="text-gray-500">{filter === 'pending' ? 'No pending approvals' : 'No users found'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((u) => (
              <Card key={u.id}>
                <div className="space-y-3">
                  {/* User info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0 text-lg">
                      {u.is_approved ? '✅' : '⏳'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{u.name || 'No Name'}</h3>
                      <p className="text-xs text-gray-500">{u.email}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge variant="info">{u.house_number || 'No House'}</Badge>
                        <Badge variant={u.payment_status === 'paid' ? 'success' : 'warning'}>
                          {PAYMENT_STATUS_LABELS[u.payment_status]}
                        </Badge>
                        <Badge>{ROLE_LABELS[u.role]}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!u.is_approved ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="success" onClick={() => handleApprove(u.id)} fullWidth>
                        ✅ Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleReject(u.id)} fullWidth>
                        ❌ Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Payment toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-16 shrink-0">Payment:</span>
                        <div className="flex gap-1.5">
                          {(['pending', 'paid'] as PaymentStatus[]).map((s) => (
                            <button key={s} onClick={() => handlePayment(u.id, s)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                u.payment_status === s
                                  ? s === 'paid' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}>
                              {s === 'paid' ? 'Paid' : 'Pending'}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Role selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-16 shrink-0">Role:</span>
                        <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          <option value="user">Resident</option>
                          <option value="admin">Admin</option>
                          <option value="guard">Guard</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                    </div>
                  )}
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
