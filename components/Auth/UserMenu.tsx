"use client";

import React from 'react';
import { useAuth } from './AuthProvider';

import { useState } from 'react';
import EditProfile from './EditProfile';

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const [editing, setEditing] = useState(false);

  if (loading) return null;
  if (!user) return null;

  const name = profile?.display_name || user.email || 'You';
  const avatar = profile?.avatar_url || user.user_metadata?.avatar_url || null;

  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        <img src={avatar} alt={name} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-sm">{(name || 'U')[0].toUpperCase()}</div>
      )}
      <div className="text-sm">
        <div className="font-medium">{name}</div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setEditing(!editing)} className="text-xs text-slate-500 hover:underline">{editing ? 'Close' : 'Edit'}</button>
          <button onClick={() => signOut()} className="text-xs text-slate-500 hover:underline">Sign out</button>
        </div>
        {editing && <div className="mt-2"><EditProfile /></div>}
      </div>
    </div>
  );
}
