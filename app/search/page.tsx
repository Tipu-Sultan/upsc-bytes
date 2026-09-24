'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import type { PostDTO } from '@/lib/types';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!q.trim()) { setItems([]); return; }
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
        const data = await response.json();
        if (data.success) setItems(data.data.items);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  return <main className="min-h-[calc(100dvh-68px)] bg-[#f4f7fb] px-4 py-7 sm:px-6 md:py-10"><div className="mx-auto max-w-6xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#173b73]"><ArrowLeft className="h-4 w-4" /> Back to feed</Link><div className="mt-7 max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#173b73]"><SlidersHorizontal className="h-3.5 w-3.5" /> Visual search</div><h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Find a Byte fast.</h1><p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">Search concepts, articles, categories and revision topics from the visual UPSC library.</p></div><div className="relative mt-7 max-w-4xl"><Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Article 21, Parliament, Geography…" className="w-full rounded-[22px] border border-slate-200 bg-white py-4 pl-13 pr-5 text-sm shadow-[0_15px_50px_rgba(15,23,42,0.07)] outline-none focus:border-[#173b73] focus:ring-4 focus:ring-blue-100" /></div>{loading && <p className="mt-5 text-sm font-semibold text-slate-400">Searching the library…</p>}{!q && <div className="mt-12 rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-4 font-black text-slate-700">Start with a UPSC concept</p><p className="mt-1 text-sm text-slate-400">Try “fundamental rights”, “monsoon” or “parliament”.</p></div>}<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((post) => <Link key={post.id} href={`/byte/${post.slug}`} className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="relative aspect-[4/5] bg-slate-950"><Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain transition duration-500 group-hover:scale-[1.02]" /></div><div className="p-5"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#173b73]">{post.categoryName}</p><h2 className="mt-2 font-black text-slate-900">{post.title}</h2><p className="mt-2 text-xs text-slate-400">{post.views.toLocaleString('en-IN')} views</p></div></Link>)}</div>{q && !loading && !items.length && <div className="mt-10 text-center text-sm text-slate-500">No Bytes matched “{q}”.</div>}</div></main>;
}
