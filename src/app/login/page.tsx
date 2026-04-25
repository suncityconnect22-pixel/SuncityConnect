'use client';

import { useState } from 'react';
import { signInWithPassword, signUpWithPassword } from '@/actions/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);
    
    if (isSignUp) {
      const result = await signUpWithPassword(formData);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // If email confirmation is disabled, user is now logged in.
        router.push('/dashboard');
        router.refresh();
      }
    } else {
      const result = await signInWithPassword(formData);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
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
          />

          <Input
            label="Password (पासवर्ड)"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {isSignUp ? 'Create Account (खाता बनाएं)' : 'Login (लॉगिन)'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
