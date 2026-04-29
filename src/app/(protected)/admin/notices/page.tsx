'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNotices, createNotice, updateNotice, deleteNotice } from '@/actions/notices';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import type { Notice } from '@/lib/types';

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  const loadNotices = useCallback(async () => {
    const result = await getNotices();
    if (result.data) setNotices(result.data as Notice[]);
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => { loadNotices(); }, [loadNotices]);

  // Realtime + polling
  useRealtimeSync('notices', loadNotices);

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setIsImportant(false);
    setShowModal(true);
  };

  const openEdit = (notice: Notice) => {
    setEditing(notice);
    setTitle(notice.title);
    setDescription(notice.description);
    setIsImportant(notice.is_important);
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.set('title', title);
    formData.set('description', description);
    formData.set('is_important', String(isImportant));

    let result;
    if (editing) {
      result = await updateNotice(editing.id, formData);
    } else {
      result = await createNotice(formData);
    }

    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: editing ? 'Notice updated' : 'Notice created', type: 'success' });
      setShowModal(false);
      await loadNotices();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notice?')) return;
    const result = await deleteNotice(id);
    if (result.error) {
      setToast({ message: result.error, type: 'error' });
    } else {
      setToast({ message: 'Notice deleted', type: 'success' });
      await loadNotices();
    }
  };

  return (
    <>
      <Header
        title="Manage Notices"
        showBack
        action={<Button size="sm" onClick={openCreate}>+ New</Button>}
      />

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-2">📋</span>
            <p className="text-gray-500">No notices yet</p>
            <Button onClick={openCreate} className="mt-4">Create First Notice</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <Card key={notice.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notice.is_important && <Badge variant="danger">Important</Badge>}
                    </div>
                    <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notice.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notice.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(notice)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Notice' : 'New Notice (नई सूचना)'}
      >
        <div className="space-y-4">
          <Input
            label="Title (शीर्षक)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notice title"
            required
          />
          <TextArea
            label="Description (विवरण)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notice details..."
            required
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isImportant}
              onChange={(e) => setIsImportant(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Mark as Important (महत्वपूर्ण)
            </span>
          </label>
          <Button onClick={handleSave} fullWidth size="lg" loading={saving}>
            {editing ? 'Update Notice' : 'Create Notice'}
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
