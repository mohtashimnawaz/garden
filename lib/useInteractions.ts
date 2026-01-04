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
      if (channelRef.current) {
        // remove channel if supabase client available
        (async () => {
          try {
            const mod = await import('./supabaseClient');
            mod.supabase.removeChannel(channelRef.current);
          } catch (e) {
            // ignore
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
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.from('interactions').insert([
        {
          plant_id: plantId,
          actor: user.id,
          kind,
          payload
        }
      ]).select();

      if (error) {
        console.error('sendInteraction error', error);
        return { ok: false, error: error.message || error.details || String(error) };
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
