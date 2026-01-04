"use client";

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../../lib/supabaseClient';

export default function AuthDebug() {
  const { user } = useAuth();
  const [info, setInfo] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function refresh() {
    setMsg(null);
    try {
      const u = (await supabase.auth.getUser()).data?.user || null;
      const profile = u ? (await supabase.from('profiles').select('*').eq('id', u.id).single()).data : null;
      setInfo({ user: u, profile });
    } catch (e: any) {
      setMsg('refresh failed: ' + (e?.message || String(e)));
    }
  }

  async function testInsert(kind = 'water') {
    setMsg(null);
    try {
      if (!user) return setMsg('not signed in');
      // Prefer a real plant id from the DB for testing, fallback to demo-1
      const p = await supabase.from('plants').select('id').limit(1).single();
      // Fallback to seeded demo plant UUID if DB query returns nothing
      const plantId = p.data?.id || '00000000-0000-0000-0000-000000000001';

      // try to insert an interaction (will be subject to RLS)
      const res = await supabase.from('interactions').insert({ plant_id: plantId, actor: user.id, kind });
      if (res.error) {
        try { console.error('AuthDebug insert error', JSON.stringify(res.error, null, 2)); } catch {}
        // Surface helpful messages for FK or policy failures
        const e: any = res.error;
        if (e.code === '23503' || (e.details && /foreign key/i.test(e.details))) {
          setMsg('insert error: Plant not found (foreign key violation). Try creating a plant first.');
        } else if ((e.message && /row-level security/i.test(e.message)) || (e.details && /policy/i.test(e.details)) || (e.message && /violates/i.test(e.message))) {
          setMsg('insert error: Blocked by DB policy (RLS) or can_interact enforcement.');
        } else {
          setMsg('insert error: ' + (res.error.message || res.error.details || String(res.error)));
        }
      } else setMsg('insert OK (or accepted by RLS) — plantId: ' + plantId);
    } catch (e: any) {
      console.error('AuthDebug insert exception', e);
      setMsg('insert failed: ' + (e?.message || String(e)));
    }
  }

  return (
    <div className="text-xs text-slate-500">
      <div className="flex gap-2 items-center">
        <button onClick={refresh} className="px-2 py-1 border rounded">Refresh auth</button>
        <button onClick={() => testInsert('water')} className="px-2 py-1 border rounded">Test water insert</button>
        <button onClick={() => testInsert('like')} className="px-2 py-1 border rounded">Test like insert</button>
        <button onClick={() => testInsert('progress')} className="px-2 py-1 border rounded">Test progress insert</button>
      </div>
      {msg && <div className="mt-1 text-rose-600">{msg}</div>}
      {info && (
        <pre className="mt-2 text-xs bg-slate-50 p-2 rounded max-w-sm overflow-auto">{JSON.stringify(info, null, 2)}</pre>
      )}
    </div>
  );
}
