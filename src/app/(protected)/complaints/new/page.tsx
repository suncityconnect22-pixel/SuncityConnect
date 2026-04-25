'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createComplaint } from '@/actions/complaints';
import Header from '@/components/Header';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';

export default function NewComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const result = await createComplaint(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/complaints');
      router.refresh();
    }
  };

  return (
    <>
      <Header title="New Complaint (नई शिकायत)" showBack />
      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="title"
            label="Title (विषय)"
            placeholder="e.g. Water leakage in parking"
            required
            autoFocus
          />

          <TextArea
            name="description"
            label="Description (विवरण)"
            placeholder="Describe the issue in detail..."
          />

          {/* Image upload placeholder — will integrate with Cloudflare R2 */}
          <input type="hidden" name="image_url" value="" />

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Submit Complaint (शिकायत दर्ज करें)
          </Button>
        </form>
      </div>
    </>
  );
}
