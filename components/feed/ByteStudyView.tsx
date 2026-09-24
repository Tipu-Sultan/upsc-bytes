'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Eye, LockKeyhole, Share2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { PostDTO } from '@/lib/types';

export function ByteStudyView({ post }: { post: PostDTO }) {
  const [views, setViews] = useState(post.views);
  const [study, setStudy] = useState({ summary: post.aiSummary || post.description || '', examAngle: post.examAngle || '', keyPoints: post.keyPoints || [] as string[], tags: post.tags });
  const [aiLoading, setAiLoading] = useState(!post.aiSummary || !post.keyPoints?.length);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    const key = `upsc-bytes:viewed:${post.id}:${day}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      fetch(`/api/posts/${post.id}/view`, { method: 'POST', keepalive: true })
        .then((response) => response.json())
        .then((data) => { if (data?.success && typeof data.data?.views === 'number') setViews(data.data.views); })
        .catch(() => undefined);
    }
    try {
      const existing = JSON.parse(sessionStorage.getItem('upsc-bytes:viewed-categories') || '[]') as string[];
      if (!existing.includes(post.categoryId)) sessionStorage.setItem('upsc-bytes:viewed-categories', JSON.stringify([...existing, post.categoryId].slice(-12)));
    } catch {}
  }, [post.categoryId, post.id]);

  useEffect(() => {
    if (post.aiSummary && post.keyPoints?.length) return;
    let cancelled = false;
    setAiLoading(true);
    fetch(`/api/posts/${post.id}/study`, { method: 'POST' })
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.success) throw new Error(data.error || 'AI study explanation is unavailable.');
        const value = data.data;
        setStudy({ summary: value.aiSummary || value.description || '', examAngle: value.examAngle || '', keyPoints: value.keyPoints || [], tags: value.tags || post.tags });
      })
      .catch((error) => { if (!cancelled) setAiError(error instanceof Error ? error.message : 'AI study explanation is unavailable.'); })
      .finally(() => { if (!cancelled) setAiLoading(false); });
    return () => { cancelled = true; };
  }, [post.aiSummary, post.description, post.id, post.keyPoints, post.tags]);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: post.title, url });
      else { await navigator.clipboard.writeText(url); toast.success('Byte link copied.'); }
    } catch {}
  }

  return <main className="min-h-[100dvh] bg-[#f4f7fb] pb-8 text-slate-900">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173b73] text-white"><BookOpen className="h-4 w-4" /></span><span className="text-base font-black">UPSC <span className="text-[#d99f00]">Bytes</span></span></Link>
        <div className="flex items-center gap-2"><Link href="/admin" aria-label="Admin access" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500"><LockKeyhole className="h-4 w-4" /></Link><button type="button" onClick={share} aria-label="Share" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500"><Share2 className="h-4 w-4" /></button></div>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm"><ArrowLeft className="h-4 w-4" /> Back to Bytes</Link>
      <div className="mt-4 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,.85fr)]">
        <div className="relative aspect-[4/5] min-h-[420px] bg-slate-950 sm:min-h-[560px] lg:aspect-auto lg:min-h-[720px]"><Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain" priority /></div>
        <article className="p-5 sm:p-8 lg:p-10">
          <div className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#173b73]">{post.categoryName}</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{post.title}</h1>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-400"><Eye className="h-4 w-4" /> {views.toLocaleString('en-IN')} daily views</div>

          <section className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex items-center gap-2 text-sm font-black text-[#173b73]"><Sparkles className="h-4 w-4 text-amber-500" /> Groq Study Explanation</div>
            {aiLoading ? <div className="mt-4 space-y-2"><div className="h-3 animate-pulse rounded bg-blue-100" /><div className="h-3 w-11/12 animate-pulse rounded bg-blue-100" /><div className="h-3 w-4/5 animate-pulse rounded bg-blue-100" /></div> : aiError ? <p className="mt-3 text-sm leading-6 text-slate-600">{aiError}</p> : <p className="mt-3 text-sm leading-6 text-slate-700">{study.summary}</p>}
          </section>

          {study.keyPoints.length > 0 && <section className="mt-6"><h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Key revision points</h2><ul className="mt-3 space-y-2.5">{study.keyPoints.map((point, index) => <li key={`${point}-${index}`} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#173b73] text-[10px] font-black text-white">{index + 1}</span><span>{point}</span></li>)}</ul></section>}

          {study.examAngle && <section className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4"><h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">UPSC exam angle</h2><p className="mt-2 text-sm leading-6 text-amber-950">{study.examAngle}</p></section>}

          {!!study.tags.length && <section className="mt-6"><h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Revision tags</h2><div className="mt-3 flex flex-wrap gap-2">{study.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">#{tag}</span>)}</div></section>}

          <div className="mt-7 rounded-2xl bg-slate-900 p-4 text-white"><p className="text-xs font-black">Study workflow</p><p className="mt-1 text-xs leading-5 text-slate-300">Read the visual first, recall the facts, then use the Groq explanation and key points for active revision.</p></div>
        </article>
      </div>
      <p className="py-6 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Design & Developed By: Tipu Sultan</p>
    </div>
  </main>;
}
