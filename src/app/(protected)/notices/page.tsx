'use client';

import { useState, useEffect, useCallback } from 'react';
import { getNotices } from '@/actions/notices';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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

  // Initial load
  useEffect(() => { loadNotices(); }, [loadNotices]);

  // Realtime + polling
  useRealtimeSync('notices', loadNotices);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (loading) {
    return (
      <>
        <Header title="Notices (सूचनाएं)" />
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

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
          <div className="space-y-2.5">
            {notices.map((notice) => {
              const isExpanded = expandedId === notice.id;
              return (
                <div
                  key={notice.id}
                  onClick={() => toggleExpand(notice.id)}
                  className="cursor-pointer"
                >
                  <Card highlight={notice.is_important}>
                    <div className="flex items-center gap-3">
                      <div className={`text-xl shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notice.is_important ? 'bg-red-50' : 'bg-blue-50'}`}>
                        {notice.is_important ? '🔴' : '📢'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {notice.is_important && (
                            <Badge variant="danger">Important</Badge>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(notice.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-0.5">{notice.title}</h3>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Expandable description */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {notice.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
