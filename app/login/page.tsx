'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setError(''); setLoading(true); try { const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Login failed'); router.push('/admin'); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Login failed'); } finally { setLoading(false); } }
  return <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center px-4"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><h1 className="text-2xl font-black text-[#173b73]">UPSC Bytes Admin</h1><p className="mt-2 text-sm text-slate-500">Sign in to manage categories and visual Bytes.</p><label className="mt-6 block text-sm font-semibold">Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="mt-4 block text-sm font-semibold">Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-2 w-full rounded-xl border px-4 py-3" /></label>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="mt-6 w-full rounded-xl bg-[#173b73] px-4 py-3 font-bold text-white disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button></form></main>;
}
