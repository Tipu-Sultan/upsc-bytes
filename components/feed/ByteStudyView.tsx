'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Eye, Share2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PostDTO } from '@/lib/types';

export function ByteStudyView({ post }: { post: PostDTO }) {
  const [views, setViews] = useState(post.views);

  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    const key = `upsc-bytes:viewed:${post.id}:${day}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');
    fetch(`/api/posts/${post.id}/view`, { method: 'POST', keepalive: true })
      .then((response) => response.json())
      .then((data) => { if (data?.success && typeof data.data?.views === 'number') setViews(data.data.views); })
      .catch(() => undefined);

    try {
      const existing = JSON.parse(sessionStorage.getItem('upsc-bytes:viewed-categories') || '[]') as string[];
      if (!existing.includes(post.categoryId)) sessionStorage.setItem('upsc-bytes:viewed-categories', JSON.stringify([...existing, post.categoryId].slice(-12)));
    } catch {}
  }, [post.categoryId, post.id]);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: post.title, url });
      else { await navigator.clipboard.writeText(url); alert('Byte link copied.'); }
    } catch {}
  }

  return <main className="min-h-[calc(100dvh-68px)] bg-[#f4f7fb] px-4 py-6 sm:px-6 md:py-10"><div className="mx-auto max-w-5xl"><div className="flex items-center justify-between gap-3"><Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm"><ArrowLeft className="h-4 w-4" /> Back to Bytes</Link><button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm"><Share2 className="h-4 w-4" /> Share</button></div><div className="mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)]"><div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]"><div className="relative min-h-[65dvh] bg-slate-950"><Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 65vw" className="object-contain" priority /></div><div className="p-6 sm:p-8 lg:p-10"><div className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#173b73]">{post.categoryName}</div><h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{post.title}</h1>{post.description && <p className="mt-5 text-[15px] leading-7 text-slate-600">{post.description}</p>}<div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400"><Eye className="h-4 w-4" /> {views.toLocaleString('en-IN')} unique daily views</div>{post.tags.length > 0 && <div className="mt-7"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Revision tags</p><div className="mt-3 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">#{tag}</span>)}</div></div>}<div className="mt-8 rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-sm font-black text-slate-800"><Sparkles className="h-4 w-4 text-amber-500" /> Study tip</div><p className="mt-2 text-sm leading-6 text-slate-500">First read the infographic, then use the title and tags to recall the topic without looking back.</p></div></div></div></div><p className="py-6 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Design & Developed By: Tipu Sultan</p></div></main>;
}
