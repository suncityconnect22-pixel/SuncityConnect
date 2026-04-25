'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStaff, createStaff, updateStaff, deleteStaff } from '@/actions/staff';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import type { Staff } from '@/lib/types';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  const load = useCallback(async () => {
    const r = await getStaff();
    if (r.data) setStaffList(r.data as Staff[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(''); setRole(''); setPhone(''); setShowModal(true); };
  const openEdit = (s: Staff) => { setEditing(s); setName(s.name); setRole(s.role); setPhone(s.phone || ''); setShowModal(true); };

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.set('name', name); fd.set('role', role); fd.set('phone', phone);
    const result = editing ? await updateStaff(editing.id, fd) : await createStaff(fd);
    if (result.error) setToast({ message: result.error, type: 'error' });
    else { setToast({ message: editing ? 'Staff updated' : 'Staff added', type: 'success' }); setShowModal(false); await load(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff member?')) return;
    const r = await deleteStaff(id);
    if (r.error) setToast({ message: r.error, type: 'error' });
    else { setToast({ message: 'Staff deleted', type: 'success' }); await load(); }
  };

  return (
    <>
      <Header title="Manage Staff" showBack action={<Button size="sm" onClick={openCreate}>+ Add</Button>} />
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-12"><span className="text-4xl block mb-2">👥</span><p className="text-gray-500">No staff added yet</p><Button onClick={openCreate} className="mt-4">Add Staff</Button></div>
        ) : (
          <div className="space-y-3">
            {staffList.map((s) => (
              <Card key={s.id}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0"><span>👷</span></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{s.name}</h3>
                    <p className="text-sm text-gray-500">{s.role} {s.phone && `• ${s.phone}`}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">✏️</button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑️</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Staff' : 'Add Staff (कर्मचारी जोड़ें)'}>
        <div className="space-y-4">
          <Input label="Name (नाम)" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Role (पद)" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Watchman, Cleaner" required />
          <Input label="Phone (फोन)" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
          <Button onClick={handleSave} fullWidth size="lg" loading={saving}>{editing ? 'Update' : 'Add Staff'}</Button>
        </div>
      </Modal>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
