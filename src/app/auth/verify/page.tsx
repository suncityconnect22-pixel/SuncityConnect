'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyOtp, signInWithOtp } from '@/actions/auth';
import Button from '@/components/ui/Button';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.push('/login');
  }, [email, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newOtp.every((d) => d) && value) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setOtp(digits);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (token: string) => {
    setLoading(true);
    setError('');
    const result = await verifyOtp(email, token);

    if (result.error) {
      setError(result.error);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setLoading(false);
    } else {
      router.push('/onboarding');
    }
  };

  const handleResend = async () => {
    setResending(true);
    const formData = new FormData();
    formData.set('email', email);
    const result = await signInWithOtp(formData);
    setResending(false);
    if (!result.error) {
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Enter OTP (कोड दर्ज करें)</h1>
          <p className="text-gray-500 mt-2 text-sm">
            We sent a 6-digit code to<br />
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all bg-white"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 mb-4 text-center">
            {error}
          </div>
        )}

        {resent && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-100 mb-4 text-center">
            OTP resent successfully! (कोड फिर भेजा गया)
          </div>
        )}

        <Button
          onClick={() => handleVerify(otp.join(''))}
          fullWidth
          size="lg"
          loading={loading}
          disabled={otp.some((d) => !d)}
        >
          Verify (सत्यापित करें)
        </Button>

        <div className="text-center mt-6">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
          >
            {resending ? 'Sending...' : "Didn't receive code? Resend (दोबारा भेजें)"}
          </button>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Change email
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
