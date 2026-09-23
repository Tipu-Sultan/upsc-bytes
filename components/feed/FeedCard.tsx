'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Eye, Info, Share2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { PostDTO } from '@/lib/types';

export function FeedCard({ post }: { post: PostDTO }) {
  const [revealed, setRevealed] = useState(false);

  async function share(event: React.MouseEvent) {
    event.stopPropagation();
    const url = `${window.location.origin}/byte/${post.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: post.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Byte link copied.');
      }
    } catch {
      // User cancelled the native share sheet.
    }
  }

  return (
    <article
      className="feed-item relative flex min-h-[calc(100dvh-124px)] items-center justify-center overflow-hidden bg-black"
      onClick={() => setRevealed((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setRevealed((value) => !value);
        }
      }}
      tabIndex={0}
      aria-label={`${post.title}. Tap to reveal details.`}
    >
      <Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 740px" className="object-contain" priority={false} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,.28)_100%)]" />
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5 transition-opacity duration-300 ${revealed ? 'opacity-100' : 'opacity-20'}`} />

      {!revealed && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
          Tap to reveal study details
        </div>
      )}

      <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
        <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300 backdrop-blur-md">{post.categoryName}</span>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2.5 sm:bottom-6 sm:right-6">
        <button type="button" onClick={share} aria-label="Share Byte" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition hover:bg-white/15">
          <Share2 className="h-4 w-4" />
        </button>
        <Link href={`/byte/${post.slug}`} onClick={(event) => event.stopPropagation()} aria-label="Open Byte" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition hover:bg-white/15">
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {revealed && (
        <div className="absolute inset-x-0 bottom-0 p-4 pb-7 sm:p-7 sm:pb-9">
          <div className="mx-auto max-w-2xl rounded-[26px] border border-white/10 bg-black/65 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="flex items-start gap-3 pr-14">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-200"><Info className="h-4 w-4" /></div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Quick revision</p>
                <h2 className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl">{post.title}</h2>
              </div>
            </div>
            {post.description && <p className="mt-4 text-sm leading-6 text-slate-200/90 sm:text-[15px]">{post.description}</p>}
            {!!post.tags.length && <div className="mt-4 flex flex-wrap gap-2">{post.tags.slice(0, 6).map((tag) => <span key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-200">#{tag}</span>)}</div>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/55"><Eye className="h-3.5 w-3.5" /> {post.views.toLocaleString('en-IN')} views</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setRevealed(false)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"><X className="h-3.5 w-3.5" /> Close</button>
                <Link href={`/byte/${post.slug}`} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950 hover:bg-blue-50"><Sparkles className="h-3.5 w-3.5" /> Study Byte</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
