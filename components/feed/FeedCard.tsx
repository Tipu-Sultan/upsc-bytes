'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Eye, Info, Share2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { PostDTO } from '@/lib/types';

export function FeedCard({ post, priority = false }: { post: PostDTO; priority?: boolean }) {
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
      // Native share was cancelled.
    }
  }

  return (
    <article
      className="feed-item relative mx-auto flex w-full max-w-[760px] items-center justify-center overflow-hidden rounded-[22px] bg-[#090d16] sm:rounded-[28px] sm:border sm:border-white/10 sm:shadow-2xl"
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
      <div className="absolute inset-0 overflow-hidden bg-[#090d16]">
        <Image src={post.imageUrl} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-35 blur-2xl" aria-hidden />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <div className="relative h-full w-full p-0 p-2 sm:p-3">
        <div className="relative h-full w-full overflow-hidden bg-black sm:rounded-[22px]">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 740px"
            className="object-contain"
            priority={priority}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
          <div className={`pointer-events-none absolute inset-0 bg-black/15 transition-opacity duration-300 ${revealed ? 'opacity-100' : 'opacity-0'}`} />

          <div className="pointer-events-none absolute left-4 top-4 sm:left-6 sm:top-6">
            <span className="rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300 backdrop-blur-md">
              {post.categoryName}
            </span>
          </div>

          {!revealed && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/60 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/80 backdrop-blur-md sm:bottom-6">
              Tap to reveal study details
            </div>
          )}

          <div className="absolute bottom-4 right-4 flex flex-col gap-2 sm:bottom-6 sm:right-6">
            <button type="button" onClick={share} aria-label="Share Byte" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:bg-white/15 sm:h-11 sm:w-11">
              <Share2 className="h-4 w-4" />
            </button>
            <Link href={`/byte/${post.slug}`} onClick={(event) => event.stopPropagation()} aria-label="Open Byte" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:bg-white/15 sm:h-11 sm:w-11">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          {revealed && (
            <div className="absolute inset-x-0 bottom-0 p-3 pb-4 sm:p-5 sm:pb-6">
              <div className="mx-auto max-w-2xl rounded-[22px] border border-white/10 bg-[#080b12]/90 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
                <div className="flex items-start gap-3 pr-12">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-200"><Info className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">Quick revision</p>
                    <h2 className="mt-1 text-lg font-black leading-tight text-white sm:text-2xl">{post.title}</h2>
                  </div>
                </div>
                {post.description && <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-200/90 sm:text-[15px] sm:leading-6">{post.description}</p>}
                {!!post.tags.length && <div className="mt-3 flex flex-wrap gap-1.5">{post.tags.slice(0, 6).map((tag) => <span key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-200">#{tag}</span>)}</div>}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/55"><Eye className="h-3.5 w-3.5" /> {post.views.toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setRevealed(false)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-white/10 px-2.5 text-[11px] font-bold text-slate-300 hover:bg-white/10"><X className="h-3.5 w-3.5" /> Close</button>
                    <Link href={`/byte/${post.slug}`} onClick={(event) => event.stopPropagation()} className="inline-flex h-9 items-center gap-1 rounded-xl bg-white px-3 text-[11px] font-black text-slate-950 hover:bg-blue-50"><Sparkles className="h-3.5 w-3.5" /> Study Byte</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
