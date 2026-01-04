"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ensureProfile, getProfile } from '@/lib/auth';

type User = any;

type AuthContext = {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const ctx = createContext<AuthContext | undefined>(undefined);

export function useAuth() {
  const c = useContext(ctx);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getUser();
        const u = data?.user || null;
        if (!mounted) return;
        setUser(u);
        if (u) {
          // ensure profile exists & load it
          await ensureProfile(u);
          const p = await getProfile(u.id);
          setProfile(p);
        }
      } catch (e) {
        console.warn('auth init failed', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) {
        await ensureProfile(u);
        const p = await getProfile(u.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    }) as any;

    return () => {
      mounted = false;
      try {
        sub?.subscription?.unsubscribe?.();
      } catch (e) {}
    };
  }, []);

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || String(err) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = useMemo(() => ({ user, profile, loading, signIn, signOut }), [user, profile, loading]);

  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}
