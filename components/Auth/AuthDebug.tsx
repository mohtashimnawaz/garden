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
      // try to insert an interaction (will be subject to RLS)
      const { error } = await supabase.from('interactions').insert({ plant_id: 'demo-1', actor: user.id, kind });
      if (error) setMsg('insert error: ' + (error.message || error.details));
      else setMsg('insert OK (or accepted by RLS)');
    } catch (e: any) {
      setMsg('insert failed: ' + (e?.message || String(e)));
    }
  }

  return (
    <div className="text-xs text-slate-500">
      <div className="flex gap-2 items-center">
        <button onClick={refresh} className="px-2 py-1 border rounded">Refresh auth</button>
        <button onClick={() => testInsert('water')} className="px-2 py-1 border rounded">Test water insert</button>
        <button onClick={() => testInsert('like')} className="px-2 py-1 border rounded">Test like insert</button>
      </div>
      {msg && <div className="mt-1 text-rose-600">{msg}</div>}
      {info && (
        <pre className="mt-2 text-xs bg-slate-50 p-2 rounded max-w-sm overflow-auto">{JSON.stringify(info, null, 2)}</pre>
      )}
    </div>
  );
}
