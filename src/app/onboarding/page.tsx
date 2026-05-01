'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, getCurrentUser } from '@/actions/users';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');

  useEffect(() => {
    const checkProfile = async () => {
      const user = await getCurrentUser();
      if (user?.name && user?.house_number) {
        if (!user.is_approved) {
          router.push('/waiting-approval');
        } else {
          router.push('/dashboard');
        }
      }
      setChecking(false);
    };
    checkProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('phone', phone);
      formData.set('house_number', houseNumber);

      const result = await updateProfile(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/waiting-approval');
      }
    } catch (err: any) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Welcome! (स्वागत है)</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Please complete your profile<br />
            (कृपया अपनी जानकारी भरें)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name (पूरा नाम)"
            placeholder="e.g. Rajesh Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Phone Number (फोन नंबर)"
            type="tel"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="House / Flat Number (मकान नंबर)"
            placeholder="e.g. A-101"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            required
            hint="This cannot be changed later"
          />

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Submit (जमा करें)
          </Button>
        </form>
      </div>
    </div>
  );
}
