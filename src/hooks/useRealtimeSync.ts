'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook that combines Supabase Realtime subscription with polling fallback.
 * Ensures data stays fresh even if Realtime is not enabled on the table.
 *
 * @param table - The Supabase table to watch
 * @param onUpdate - Callback to refresh data
 * @param pollIntervalMs - How often to poll as fallback (default: 10s)
 */
export function useRealtimeSync(
  table: string,
  onUpdate: () => void,
  pollIntervalMs: number = 10000
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const stableOnUpdate = useCallback(() => {
    onUpdateRef.current();
  }, []);

  useEffect(() => {
    // 1. Supabase Realtime subscription
    const channel = supabase
      .channel(`realtime:${table}_${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          stableOnUpdate();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to ${table}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(`[Realtime] Channel error for ${table}, polling is active as fallback`);
        }
      });

    // 2. Polling fallback — works even if Realtime is disabled
    const interval = setInterval(() => {
      stableOnUpdate();
    }, pollIntervalMs);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [table, pollIntervalMs, stableOnUpdate]);
}
