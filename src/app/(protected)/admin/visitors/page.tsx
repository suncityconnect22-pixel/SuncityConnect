'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllVisitors } from '@/actions/visitors';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import { VISITOR_TYPE_ICONS, VISITOR_TYPE_LABELS } from '@/lib/constants';
import type { Visitor } from '@/lib/types';

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVisitors = useCallback(async () => {
    const result = await getAllVisitors();
    if (result.data) setVisitors(result.data as Visitor[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  return (
    <>
      <Header title="All Society Visitors" showBack />

      <div className="px-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="text-sm text-gray-500 mb-4">
          Showing the last 100 visitor entries across the entire society.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-2">📋</span>
            <p className="text-gray-500">No visitors recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visitors.map((visitor) => (
              <Card key={visitor.id} className="border-l-4 border-l-blue-400">
                <div className="flex items-center gap-3">
                  {visitor.photo_url ? (
                    <img src={visitor.photo_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-200" />
                  ) : (
                    <div className="text-2xl shrink-0 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      {VISITOR_TYPE_ICONS[visitor.visitor_type] || '👤'}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-gray-900 truncate">
                        {visitor.name || VISITOR_TYPE_LABELS[visitor.visitor_type]}
                      </span>
                      <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md shrink-0 shadow-sm">
                        House {visitor.house_number}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      <span>
                        <span className="font-semibold text-gray-400">Date:</span>{' '}
                        {new Date(visitor.entry_time).toLocaleDateString('en-IN')}
                      </span>
                      <span>
                        <span className="font-semibold text-gray-400">In:</span>{' '}
                        {new Date(visitor.entry_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {visitor.exit_time && (
                        <span className="text-green-600 font-medium bg-green-50 px-1 rounded">
                          <span className="font-semibold text-green-700/60">Out:</span>{' '}
                          {new Date(visitor.exit_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
