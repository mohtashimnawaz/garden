"use client";

import React from 'react';
import { useAuth } from './AuthProvider';

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();

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
        <button onClick={() => signOut()} className="text-xs text-slate-500 hover:underline">Sign out</button>
      </div>
    </div>
  );
}
