'use client';

import { useState } from 'react';
import { signInWithPassword, signUpWithPassword } from '@/actions/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

    try {
      const formData = new FormData();
      formData.set('email', email);
      formData.set('password', password);
      
      if (isSignUp) {
        const result = await signUpWithPassword(formData);
        if (result.error) {
          setError(result.error);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        const result = await signInWithPassword(formData);
        if (result.error) {
          setError(result.error);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-sm">
        {/* Logo / Branding — text logo only */}
        <div className="text-center mb-10">
          <Image 
            src="/suncity-text-logo.png" 
            alt="SuncityConnect" 
            width={400} 
            height={80} 
            className="mx-auto mb-3"
            style={{ width: '100%', height: 'auto', maxWidth: '380px' }}
            priority
          />
          <p className="text-gray-500 mt-1 text-sm">Smart Society Management</p>
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
