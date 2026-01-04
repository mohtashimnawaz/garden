"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '../../lib/supabaseClient';

export default function EditProfile() {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name || '');
    setAvatar(profile?.avatar_url || '');
  }, [profile]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, display_name: displayName, avatar_url: avatar });
    setSaving(false);
    if (error) alert('Save failed: ' + error.message);
    else alert('Profile saved');
  }

  if (!user) return null;

  return (
    <form onSubmit={onSave} className="space-y-2">
      <div>
        <label className="text-xs text-slate-600">Display name</label>
        <input className="w-full border px-2 py-1 rounded" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-slate-600">Avatar URL</label>
        <input className="w-full border px-2 py-1 rounded" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
      </div>
      <button className="px-3 py-1 bg-blue-600 text-white rounded" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
