'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getNotices } from '@/actions/notices';
import { useRouter } from 'next/navigation';
import type { Notice } from '@/lib/types';

/**
 * Global new-notice popup banner.
 * Placed in the protected layout — monitors for new notices
 * and shows a slide-in card when one appears.
 */
export default function NewNoticeBanner() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const lastNoticeIdRef = useRef<string | null>(null);
  const initialLoadDone = useRef(false);
  const router = useRouter();

  const checkForNewNotices = useCallback(async () => {
    try {
      const result = await getNotices();
      if (result.data && result.data.length > 0) {
        const latest = result.data[0] as Notice;
        
        // On first load, just store the ID — don't show popup
        if (!initialLoadDone.current) {
          lastNoticeIdRef.current = latest.id;
          initialLoadDone.current = true;
          return;
        }

        // If we have a new notice that wasn't seen before
        if (latest.id !== lastNoticeIdRef.current) {
          lastNoticeIdRef.current = latest.id;
          setNotice(latest);
          setExiting(false);
          setVisible(true);

          // Auto-dismiss after 15 seconds
          setTimeout(() => {
            handleDismiss();
          }, 15000);
        }
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkForNewNotices();

    // Poll every 10s
    const interval = setInterval(checkForNewNotices, 10000);
    return () => clearInterval(interval);
  }, [checkForNewNotices]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
      setNotice(null);
    }, 400);
  };

  const handleView = () => {
    handleDismiss();
    router.push('/notices');
  };

  if (!visible || !notice) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-3 pointer-events-none transition-all duration-400 ${
        exiting ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
      style={{ animation: exiting ? undefined : 'noticeSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
    >
      <div
        className="w-full max-w-lg pointer-events-auto rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          background: notice.is_important
            ? 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 50%, #ffe4e6 100%)'
            : 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 50%, #e0f2fe 100%)',
          borderColor: notice.is_important ? '#fca5a5' : '#93c5fd',
          boxShadow: notice.is_important
            ? '0 20px 60px rgba(239, 68, 68, 0.2), 0 4px 20px rgba(239, 68, 68, 0.1)'
            : '0 20px 60px rgba(59, 130, 246, 0.2), 0 4px 20px rgba(59, 130, 246, 0.1)',
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1"
          style={{
            background: notice.is_important
              ? 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)'
              : 'linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s linear infinite',
          }}
        />

        <div className="p-4">
          {/* Header with close */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  notice.is_important
                    ? 'bg-red-100 shadow-inner'
                    : 'bg-blue-100 shadow-inner'
                }`}
                style={{ animation: 'noticePulse 2s ease-in-out infinite' }}
              >
                {notice.is_important ? '🚨' : '📢'}
              </div>
              <div>
                <p className={`text-[10px] font-extrabold uppercase tracking-[0.15em] ${
                  notice.is_important ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {notice.is_important ? '⚠️ Important Notice' : '🔔 New Notice'}
                </p>
                <h3 className="font-bold text-gray-900 text-sm leading-snug mt-0.5 line-clamp-2">
                  {notice.title}
                </h3>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/70 hover:bg-white text-gray-400 hover:text-gray-600 transition-all shrink-0 border border-gray-200/50 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Date + CTA */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
            <span className="text-[11px] text-gray-500 font-medium">
              {new Date(notice.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              onClick={handleView}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm ${
                notice.is_important
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              View Notice →
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes noticeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes noticePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
