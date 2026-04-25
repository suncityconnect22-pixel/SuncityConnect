'use client';

import { useState } from 'react';
import { signInWithOtp } from '@/actions/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.set('email', email);
    const result = await signInWithOtp(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🏘️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SuncityConnect</h1>
          <p className="text-gray-500 mt-1 text-sm">Smart Society Management</p>
          <p className="text-gray-400 text-xs mt-0.5">स्मार्ट सोसाइटी प्रबंधन</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address (ईमेल)"
            type="email"
            placeholder="yourname@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Send OTP (कोड भेजें)
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          We'll send a one-time code to your email.<br />
          No password needed (पासवर्ड की जरूरत नहीं)
        </p>
      </div>
    </div>
  );
}
