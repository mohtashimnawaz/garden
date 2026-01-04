'use client';

import { useEffect, useState, useRef } from 'react';

export type Interaction = {
  id: number | string;
  plant_id: string;
  actor: string;
  kind: string;
  payload?: any;
  created_at: string;
};

export function useInteractions(onInsert?: (row: Interaction) => void) {
  const channelRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    let localChannel: any = null;

    async function setup() {
      try {
        const mod = await import('./supabaseClient');
        const supabase = mod.supabase;
        // subscribe to inserts on interactions
        localChannel = supabase
          .channel('public:interactions')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'interactions' },
            (payload: any) => {
              const row = payload.new as Interaction;
              onInsert?.(row);
            }
          )
          .subscribe((status: any) => {
            if (!mounted) return;
            if (status === 'SUBSCRIBED') setConnected(true);
          });

        channelRef.current = localChannel;
      } catch (err) {
        console.warn('Realtime setup failed or Supabase not configured', err);
      }
    }

    setup();

    return () => {
      mounted = false;
      const ch = channelRef.current;
      if (ch) {
        // remove channel if supabase client available, but be defensive about channel shape
        (async () => {
          try {
            const mod = await import('./supabaseClient');
            // Prefer calling unsubscribe directly if available (avoids removeChannel internals
            // throwing when the channel shape doesn't match expectations).
            if (typeof ch.unsubscribe === 'function') {
              try {
                ch.unsubscribe();
              } catch (e) {
                // If direct unsubscribe fails, try supabase.removeChannel as a fallback.
                try { mod.supabase.removeChannel(ch); } catch (e2) { /* ignore */ }
              }
            } else {
              // Only call removeChannel if it appears safe to do so
              try { mod.supabase.removeChannel(ch); } catch (e) { /* ignore */ }
            }
          } catch (e) {
            // ignore import or removal errors
          }
        })();
        channelRef.current = null;
      }
    };
  }, [onInsert]);

  async function sendInteraction(plantId: string, kind: string, payload: any = {}) {
    try {
      const mod = await import('./supabaseClient');
      const supabase = mod.supabase;

      const userRes = await supabase.auth.getUser();
      const user = userRes.data?.user;
      console.debug('sendInteraction attempt', { plantId, kind, user });
      if (!user) return { ok: false, error: 'Not authenticated' };

      const { data, error } = await supabase.from('interactions').insert([
        {
          plant_id: plantId,
          actor: user.id,
          kind,
          payload
        }
      ]).select();

      if (error) {
        // Log full error details to help diagnose 400 responses (RLS / validation issues)
        try { console.error('sendInteraction error details', JSON.stringify(error, null, 2)); } catch {}
        const e: any = error;
        let friendly = e.message || e.details || String(e);

        // Common postgresql error codes and messages
        if (e.code === '23503' || (e.details && /foreign key/i.test(e.details))) {
          friendly = 'Plant not found (foreign key violation) — ensure the plant exists in the database.';
        } else if ((e.message && /row-level security/i.test(e.message)) || (e.details && /policy/i.test(e.details)) || (e.message && /violates/i.test(e.message))) {
          friendly = 'Insert blocked by DB policy (RLS) or can_interact check. You may be rate-limited or not authorized to interact with this plant.';
        }

        console.error('sendInteraction error info', { plantId, kind, payload, friendly, raw: e });
        return { ok: false, error: friendly, raw: e, status: e.status || e.code };
      }

      console.debug('sendInteraction result', { data });
      return { ok: true, data };
    } catch (err: any) {
      console.error('sendInteraction exception', err);
      return { ok: false, error: err.message || String(err) };
    }
  }

  return { connected, sendInteraction };
}
