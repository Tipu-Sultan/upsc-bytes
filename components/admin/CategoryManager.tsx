'use client';

import { Check, FolderPlus, Power, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { CategoryDTO } from '@/lib/types';
import { broadcastContentChange } from '@/lib/client/feed-store';

export function CategoryManager({ initial }: { initial: CategoryDTO[] }) {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!name.trim()) { toast.error('Category name is required.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), description: description.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to create category.');
      setItems((current) => [...current, data.data]);
      setName(''); setDescription('');
      broadcastContentChange();
      toast.success('Category created.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to create category.'); }
    finally { setLoading(false); }
  }

  async function toggle(item: CategoryDTO) {
    try {
      const response = await fetch(`/api/categories/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: item.name, description: item.description, isActive: !item.isActive }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Failed to update category.');
      setItems((current) => current.map((category) => category.id === item.id ? data.data : category));
      broadcastContentChange();
      toast.success(`${item.name} is now ${data.data.isActive ? 'active' : 'inactive'}.`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed to update category.'); }
  }

  return <div className="space-y-7">
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
      <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#173b73]"><FolderPlus className="h-5 w-5" /></div><div><h2 className="text-xl font-black">Create a category</h2><p className="mt-1 text-sm text-slate-500">Keep the learning library organised around clear UPSC themes.</p></div></div>
      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1.3fr_auto]"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#173b73] focus:bg-white focus:ring-4 focus:ring-blue-100" /><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-[#173b73] focus:bg-white focus:ring-4 focus:ring-blue-100" /><button onClick={create} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173b73] px-5 py-3.5 text-sm font-black text-white disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Create</button></div>
    </section>
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]"><div className="border-b border-slate-100 px-6 py-5 md:px-8"><h3 className="font-black">Category library</h3></div><div className="divide-y divide-slate-100">{items.map((category) => <div key={category.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center md:px-8"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#173b73]"><FolderPlus className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-bold text-slate-900">{category.name}</p><p className="mt-1 text-xs text-slate-400">/{category.slug}</p></div><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{category.isActive ? 'Active' : 'Inactive'}</span><button onClick={() => toggle(category)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><Power className="h-3.5 w-3.5" /> Toggle</button></div>)}{!items.length && <p className="px-8 py-12 text-center text-sm text-slate-500">No categories yet.</p>}</div></section>
  </div>;
}
