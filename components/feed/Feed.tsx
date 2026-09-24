'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, LockKeyhole, Menu, RefreshCw, Search, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import type { CategoryDTO, FeedResponse } from '@/lib/types';
import { FeedCard } from './FeedCard';
import { feedCacheKey, getCachedFeed, setCachedFeed, subscribeToContentChanges, clearFeedCache } from '@/lib/client/feed-store';

type FeedProps = {
  initial: FeedResponse;
  categories?: CategoryDTO[];
  initialCategoryId?: string;
};

export function Feed({ initial, categories = [], initialCategoryId = '' }: FeedProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [postQuery, setPostQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [recommended, setRecommended] = useState(false);
  const [viewedCategories, setViewedCategories] = useState<string[]>([]);
  const key = feedCacheKey(selectedCategory, postQuery);
  const cached = getCachedFeed(key);
  const [data, setData] = useState<FeedResponse>(() => cached ?? (selectedCategory === initialCategoryId && !postQuery ? initial : { items: [], nextCursor: null, hasMore: false }));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dataRef = useRef(data);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const requestId = useRef(0);
  const firstRenderKey = useRef(key);

  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => { if (menuOpen) (document.activeElement as HTMLElement | null)?.blur(); }, [menuOpen]);

  useEffect(() => {
    const initialKey = feedCacheKey(initialCategoryId, '');
    if (!getCachedFeed(initialKey)) setCachedFeed(initialKey, initial);
    try { setViewedCategories(JSON.parse(sessionStorage.getItem('upsc-bytes:viewed-categories') || '[]')); } catch {}
  }, [initial, initialCategoryId]);

  const visibleCategories = useMemo(() => {
    const value = categoryQuery.trim().toLowerCase();
    return value ? categories.filter((category) => category.name.toLowerCase().includes(value)) : categories;
  }, [categories, categoryQuery]);
  const activeCategory = categories.find((category) => category.id === selectedCategory);

  const fetchFeed = useCallback(async (mode: 'replace' | 'append', appendCursor?: string | null, force = false) => {
    const currentKey = feedCacheKey(selectedCategory, postQuery);
    if (mode === 'replace' && !force) {
      const existing = getCachedFeed(currentKey);
      if (existing) { setData(existing); return; }
    }

    const id = ++requestId.current;
    if (mode === 'replace') setRefreshing(true); else setLoading(true);
    try {
      const params = new URLSearchParams();
      if (mode === 'append' && appendCursor) params.set('cursor', appendCursor);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (postQuery.trim()) params.set('q', postQuery.trim());
      const response = await fetch(`/api/posts${params.toString() ? `?${params.toString()}` : ''}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Unable to load Bytes.');
      if (id !== requestId.current) return;
      const next: FeedResponse = mode === 'replace' ? json.data : { ...json.data, items: [...dataRef.current.items, ...json.data.items] };
      setCachedFeed(currentKey, next); dataRef.current = next; setData(next);
    } catch (error) {
      if (mode === 'replace') toast.error(error instanceof Error ? error.message : 'Unable to refresh the feed.');
    } finally {
      if (id === requestId.current) { setLoading(false); setRefreshing(false); }
    }
  }, [postQuery, selectedCategory]);

  useEffect(() => {
    const currentKey = feedCacheKey(selectedCategory, postQuery);
    if (firstRenderKey.current === currentKey) { firstRenderKey.current = ''; return; }
    const timer = window.setTimeout(() => fetchFeed('replace'), postQuery.trim() ? 320 : 0);
    return () => window.clearTimeout(timer);
  }, [fetchFeed, postQuery, selectedCategory]);

  useEffect(() => subscribeToContentChanges(() => {
    clearFeedCache();
    fetchFeed('replace', undefined, true);
  }), [fetchFeed]);

  const loadMore = useCallback(() => {
    if (!data.nextCursor || loading || refreshing) return;
    fetchFeed('append', data.nextCursor);
  }, [data.nextCursor, fetchFeed, loading, refreshing]);

  useEffect(() => {
    if (!sentinel.current) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: '700px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loadMore]);

  function chooseCategory(id: string) {
    setSelectedCategory(id); setRecommended(false); setMenuOpen(false); setCategoryQuery('');
  }

  function showRecommendations() {
    setRecommended((value) => !value);
    toast.success('Study Mix uses your current browsing pattern; no account is required.');
  }

  const displayItems = useMemo(() => {
    if (!recommended || data.items.length < 2) return data.items;
    const history = new Set(viewedCategories);
    return [...data.items].sort((a, b) => Number(history.has(b.categoryId)) - Number(history.has(a.categoryId)));
  }, [data.items, recommended, viewedCategories]);

  return (
    <main className="min-h-[100dvh] bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(245,158,11,0.08),transparent_25%)]" />
      <div className="relative mx-auto grid min-h-[100dvh] max-w-[1540px] grid-cols-1 lg:grid-cols-[270px_minmax(0,780px)_250px] lg:gap-5 xl:grid-cols-[290px_minmax(0,800px)_270px]">
        <aside className="sticky top-0 z-40 hidden h-[100dvh] border-r border-white/8 bg-[#0a0f1c]/85 px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
          <Brand />
          <CategoryPanel categories={categories} selectedCategory={selectedCategory} categoryQuery={categoryQuery} setCategoryQuery={setCategoryQuery} chooseCategory={chooseCategory} visibleCategories={visibleCategories} />
          <FooterCredit />
        </aside>

        <section className="relative min-w-0 pb-[78px] lg:pb-0">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-[#070b14]/92 backdrop-blur-xl">
            <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open categories" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"><Menu className="h-5 w-5" /></button>
                <Brand compact />
                <div className="hidden min-w-0 border-l border-white/10 pl-4 sm:block"><p className="text-[9px] font-black uppercase tracking-[0.24em] text-blue-300">Visual learning</p><h1 className="truncate text-sm font-black text-white">{activeCategory?.name ?? 'UPSC Bytes'}</h1></div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button type="button" onClick={showRecommendations} className={`hidden h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold sm:inline-flex ${recommended ? 'border-blue-400/30 bg-blue-500/15 text-blue-200' : 'border-white/10 bg-white/5 text-slate-300'}`}><Sparkles className="h-3.5 w-3.5" /> Mix</button>
                <Link href="/search" className="hidden h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 text-[11px] font-bold text-slate-300 sm:inline-flex"><Search className="h-3.5 w-3.5" /> Search</Link>
                <Link href="/admin" aria-label="Admin access" title="Admin access" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white"><LockKeyhole className="h-3.5 w-3.5" /></Link>
                <button type="button" onClick={() => fetchFeed('replace', undefined, true)} disabled={refreshing} aria-label="Refresh feed" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /></button>
              </div>
            </div>
            <div className="px-4 pb-3 sm:px-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input value={postQuery} onChange={(event) => setPostQuery(event.target.value)} placeholder="Search Bytes — Article 21, Parliament, monsoon…" className="h-12 w-full rounded-2xl border border-white/10 bg-[#131a29] pl-11 pr-10 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/10" />
                {postQuery && <button type="button" onClick={() => setPostQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-4 w-4" /></button>}
              </div>
            </div>
          </header>

          <div className="feed-scroll px-0 py-0 sm:px-3 sm:py-3">
            {displayItems.map((post, index) => <FeedCard key={post.id} post={post} priority={index === 0} />)}
            {!loading && !displayItems.length && <div className="mx-4 my-10 rounded-3xl border border-white/10 bg-white/[0.035] p-10 text-center text-sm text-slate-400">No Bytes found for this selection.</div>}
            <div ref={sentinel} className="h-12" />
            {loading && <div className="py-4 text-center text-xs font-bold text-slate-500">Loading more Bytes…</div>}
          </div>
        </section>

        <aside className="sticky top-0 hidden h-[100dvh] flex-col gap-4 py-6 pr-5 lg:flex">
          <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Current collection</p>
            <h2 className="mt-3 text-xl font-black">{activeCategory?.name ?? 'All UPSC Bytes'}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">A visual-first stream of concise concepts, facts and revision material for UPSC preparation.</p>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3"><span className="text-xs font-bold text-slate-400">Visible Bytes</span><span className="text-sm font-black">{displayItems.length}</span></div>
          </div>
          <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Quick navigation</p>
            <div className="mt-4 space-y-2">
              <Link href="/search" className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/5">Full search <Search className="h-4 w-4" /></Link>
              <Link href="/admin" className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-slate-300 hover:bg-white/5">Admin access <LockKeyhole className="h-4 w-4" /></Link>
            </div>
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#080c15]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          <BottomNav href="/" icon={<BookOpen className="h-4 w-4" />} label="Home" active={!selectedCategory} />
          <button type="button" onClick={() => setMenuOpen(true)} className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-400"><Menu className="h-4 w-4" />Categories</button>
          <Link href="/search" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-400"><Search className="h-4 w-4" />Search</Link>
          <Link href="/admin" className="flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-slate-400"><LockKeyhole className="h-4 w-4" />Admin</Link>
        </div>
      </nav>

      {menuOpen && <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
        <button type="button" aria-label="Close categories" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/65" />
        <aside className="absolute inset-y-0 left-0 w-[min(86vw,360px)] overflow-y-auto bg-[#0a0f1c] p-5 shadow-2xl">
          <div className="flex items-center justify-between"><Brand /><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"><X className="h-5 w-5" /></button></div>
          <CategoryPanel categories={categories} selectedCategory={selectedCategory} categoryQuery={categoryQuery} setCategoryQuery={setCategoryQuery} chooseCategory={chooseCategory} visibleCategories={visibleCategories} mobile />
          <FooterCredit />
        </aside>
      </div>}
    </main>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-[#173b73] text-white shadow-lg shadow-blue-950/30"><BookOpen className="h-4 w-4" /></span><span className={compact ? 'text-base font-black tracking-tight' : 'text-lg font-black tracking-tight'}>UPSC <span className="text-amber-300">Bytes</span></span></Link>;
}

function CategoryPanel({ categories, selectedCategory, categoryQuery, setCategoryQuery, chooseCategory, visibleCategories, mobile = false }: {
  categories: CategoryDTO[]; selectedCategory: string; categoryQuery: string; setCategoryQuery: (value: string) => void; chooseCategory: (id: string) => void; visibleCategories: CategoryDTO[]; mobile?: boolean;
}) {
  return <div className={`${mobile ? 'mt-8' : 'mt-9'} flex flex-col`}>
    <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Explore categories</p>
    <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input autoFocus={false} value={categoryQuery} onChange={(event) => setCategoryQuery(event.target.value)} placeholder="Search categories…" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50" /></div>
    <div className="no-scrollbar mt-4 max-h-[55dvh] space-y-1 overflow-y-auto pr-1">
      <CategoryButton active={!selectedCategory} onClick={() => chooseCategory('')} name="All Bytes" />
      {visibleCategories.map((category) => <CategoryButton key={category.id} active={selectedCategory === category.id} onClick={() => chooseCategory(category.id)} name={category.name} />)}
    </div>
  </div>;
}

function CategoryButton({ active, name, onClick }: { active: boolean; name: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold transition ${active ? 'bg-blue-500/15 text-blue-200 ring-1 ring-inset ring-blue-400/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><span className="truncate">{name}</span>{active && <ChevronDown className="h-4 w-4 -rotate-90 text-blue-300" />}</button>;
}

function BottomNav({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return <Link href={href} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-bold ${active ? 'bg-blue-500/10 text-blue-200' : 'text-slate-400'}`}>{icon}{label}</Link>;
}

function FooterCredit() {
  return <div className="mt-auto pt-6"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Designed & developed by Tipu Sultan</p></div>;
}
