'use client';

import { signOut } from '@/actions/auth';
import Button from '@/components/ui/Button';

export default function WaitingApprovalPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-yellow-50 to-white">
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⏳</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Waiting for Approval
        </h1>
        <p className="text-gray-500 text-base mb-1">
          (अनुमोदन की प्रतीक्षा में)
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6 text-left shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">
            Your account has been created successfully. The society admin will review and approve your account soon.
          </p>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            आपका खाता सफलतापूर्वक बनाया गया है। सोसाइटी एडमिन जल्द ही आपके खाते की समीक्षा करेंगे।
          </p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 mt-4 border border-blue-100">
          <p className="text-sm text-blue-700">
            💡 Please contact your society president/manager if this takes too long.
          </p>
        </div>

        <form action={signOut} className="mt-8">
          <Button type="submit" variant="ghost" fullWidth>
            Logout (लॉगआउट)
          </Button>
        </form>
      </div>
    </div>
  );
}
