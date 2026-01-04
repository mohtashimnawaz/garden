"use client";

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const { signIn } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const res = await signIn(email);
    if (res.ok) setStatus('check your email for a magic link');
    else setStatus(res.error || 'error');
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        type="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm w-64"
      />
      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm">Send magic link</button>
      {status && <div className="text-sm text-slate-500">{status}</div>}
    </form>
  );
}
