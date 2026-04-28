'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ImageWithModal from '@/components/ui/ImageWithModal';
import { VISITOR_TYPE_LABELS, VISITOR_TYPE_ICONS } from '@/lib/constants';
import EmptyState from '@/components/ui/EmptyState';

interface Visitor {
  id: string;
  name: string | null;
  visitor_type: string;
  photo_url: string | null;
  entry_time: string;
  exit_time: string | null;
  house_number: string;
}

export default function VisitorList({ initialVisitors, houseNumber }: { initialVisitors: Visitor[], houseNumber: string }) {
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);

  useEffect(() => {
    // Subscribe to new visitors for this house
    const channel = supabase
      .channel('realtime:visitors')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'visitors',
          filter: `house_number=eq.${houseNumber}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          
          if (payload.eventType === 'INSERT') {
            const newVisitor = payload.new as Visitor;
            setVisitors((prev) => [newVisitor, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedVisitor = payload.new as Visitor;
            setVisitors((prev) => prev.map(v => v.id === updatedVisitor.id ? updatedVisitor : v));
          } else if (payload.eventType === 'DELETE') {
            setVisitors((prev) => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [houseNumber]);

  if (visitors.length === 0) {
    return (
      <EmptyState
        icon="🚪"
        title="No Visitors Yet"
        description="No visitors have been recorded for your house."
      />
    );
  }

  return (
    <div className="space-y-3">
      {visitors.map((visitor) => (
        <Card key={visitor.id} className="animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="flex items-center gap-3">
            {visitor.photo_url ? (
              <ImageWithModal 
                src={visitor.photo_url} 
                className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-gray-100 shadow-sm" 
              />
            ) : (
              <div className="text-3xl shrink-0 w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                {VISITOR_TYPE_ICONS[visitor.visitor_type as keyof typeof VISITOR_TYPE_ICONS] || '👤'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {visitor.name || 'Unknown Visitor'}
                </h3>
                <Badge variant="info">
                  {VISITOR_TYPE_LABELS[visitor.visitor_type as keyof typeof VISITOR_TYPE_LABELS]}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>
                  In: {new Date(visitor.entry_time).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {visitor.exit_time ? (
                  <span className="text-green-600 font-medium">
                    Out: {new Date(visitor.exit_time).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                ) : (
                  <span className="text-orange-500 font-medium bg-orange-50 px-1.5 py-0.5 rounded">
                    Still Inside
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
