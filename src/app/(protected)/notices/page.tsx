'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNotices } from '@/actions/notices';
import Header from '@/components/Header';
import EmptyState from '@/components/ui/EmptyState';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import type { Notice } from '@/lib/types';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadNotices = useCallback(async () => {
    const result = await getNotices();
    if (result.data) setNotices(result.data as Notice[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadNotices(); }, [loadNotices]);
  useRealtimeSync('notices', loadNotices);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (loading) {
    return (
      <>
        <Header title="Notices (सूचनाएं)" />
        <div className="px-4 py-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl bg-gray-50 p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded-full w-20" />
                  <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  const importantNotices = notices.filter(n => n.is_important);
  const regularNotices = notices.filter(n => !n.is_important);

  return (
    <>
      <Header title="Notices (सूचनाएं)" />
      <div className="px-4 py-4">
        {notices.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No Notices Yet"
            description="There are no notices at the moment. Check back later!"
          />
        ) : (
          <div className="space-y-4">
            {/* Important Notices Section */}
            {importantNotices.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <h2 className="text-xs font-extrabold text-red-600 uppercase tracking-[0.15em]">
                    Important Notices
                  </h2>
                </div>
                <div className="space-y-3">
                  {importantNotices.map(notice => (
                    <NoticeCard
                      key={notice.id}
                      notice={notice}
                      isExpanded={expandedId === notice.id}
                      onToggle={() => toggleExpand(notice.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notices */}
            {regularNotices.length > 0 && (
              <div>
                {importantNotices.length > 0 && (
                  <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3 mt-2">
                    📋 All Notices
                  </h2>
                )}
                <div className="space-y-3">
                  {regularNotices.map(notice => (
                    <NoticeCard
                      key={notice.id}
                      notice={notice}
                      isExpanded={expandedId === notice.id}
                      onToggle={() => toggleExpand(notice.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function NoticeCard({ notice, isExpanded, onToggle }: { notice: Notice; isExpanded: boolean; onToggle: () => void }) {
  const isImportant = notice.is_important;
  const isNew = Date.now() - new Date(notice.created_at).getTime() < 24 * 60 * 60 * 1000; // < 24h

  return (
    <div
      onClick={onToggle}
      className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
        isImportant
          ? 'border-red-200 bg-gradient-to-br from-red-50 via-white to-rose-50 shadow-[0_4px_24px_rgba(239,68,68,0.1)]'
          : 'border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]'
      } ${isExpanded ? 'ring-2 ring-offset-1' : ''} ${
        isExpanded && isImportant ? 'ring-red-300' : isExpanded ? 'ring-blue-300' : ''
      }`}
    >
      {/* Accent bar for important notices */}
      {isImportant && (
        <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
            isImportant
              ? 'bg-red-100 shadow-inner'
              : 'bg-blue-50 shadow-inner'
          }`}>
            {isImportant ? '🚨' : '📢'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isImportant && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                  </span>
                  Important
                </span>
              )}
              {isNew && !isImportant && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  New
                </span>
              )}
              <span className="text-[11px] text-gray-400 font-medium">
                {new Date(notice.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <h3 className={`font-bold mt-1.5 leading-snug ${
              isImportant ? 'text-gray-900 text-[15px]' : 'text-gray-800 text-sm'
            }`}>
              {notice.title}
            </h3>
          </div>

          {/* Expand icon */}
          <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
            isExpanded
              ? isImportant ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
              : 'bg-gray-50 text-gray-400'
          }`}>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Expandable description */}
        <div
          className={`overflow-hidden transition-all duration-400 ease-in-out ${
            isExpanded ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`pt-3 border-t ${isImportant ? 'border-red-100' : 'border-gray-100'}`}>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {notice.description}
            </p>
            <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Posted on {new Date(notice.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
