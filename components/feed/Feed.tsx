'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronDown, ExternalLink, Menu, RefreshCw, Search, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { CategoryDTO, FeedResponse, PostDTO } from '@/lib/types';
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
  const key = feedCacheKey(selectedCategory, postQuery);
  const cached = getCachedFeed(key);
  const [data, setData] = useState<FeedResponse>(() => cached ?? (selectedCategory === initialCategoryId && !postQuery ? initial : { items: [], nextCursor: null, hasMore: false }));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [recommended, setRecommended] = useState(false);
  const [viewedCategories, setViewedCategories] = useState<string[]>([]);
  const dataRef = useRef(data);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const requestId = useRef(0);
  const firstRenderKey = useRef(key);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!getCachedFeed(feedCacheKey(initialCategoryId, ''))) setCachedFeed(feedCacheKey(initialCategoryId, ''), initial);
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
      if (existing) {
        setData(existing);
        return;
      }
    }

    const id = ++requestId.current;
    if (mode === 'replace') setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (mode === 'append' && appendCursor) params.set('cursor', appendCursor);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (postQuery.trim()) params.set('q', postQuery.trim());

      const response = await fetch(`/api/posts${params.toString() ? `?${params.toString()}` : ''}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error ?? 'Unable to load Bytes.');
      if (id !== requestId.current) return;

      const next: FeedResponse = mode === 'replace'
        ? json.data
        : { ...json.data, items: [...dataRef.current.items, ...json.data.items] };
      setCachedFeed(currentKey, next);
      dataRef.current = next;
      setData(next);
    } catch (error) {
      if (mode === 'replace') toast.error(error instanceof Error ? error.message : 'Unable to refresh the feed.');
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [postQuery, selectedCategory]);

  useEffect(() => {
    const currentKey = feedCacheKey(selectedCategory, postQuery);
    if (firstRenderKey.current === currentKey) {
      firstRenderKey.current = '';
      return;
    }
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: '800px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loadMore]);

  function chooseCategory(id: string) {
    setSelectedCategory(id);
    setRecommended(false);
    setMobileFilters(false);
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
    <main className="min-h-[100dvh] overflow-hidden bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_90%_80%,rgba(245,158,11,0.08),transparent_25%)]" />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-[1540px] grid-cols-1 lg:grid-cols-[290px_minmax(0,720px)_250px] lg:gap-6 xl:grid-cols-[310px_minmax(0,740px)_280px]">
        <aside className="sticky top-0 z-40 hidden h-[100dvh] border-r border-white/8 bg-[#0a0f1c]/85 px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
          <Brand />
          <div className="mt-9">
            <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Explore categories</p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input value={categoryQuery} onChange={(event) => setCategoryQuery(event.target.value)} placeholder="Search categories…" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/8" />
            </div>
          </div>
          <div className="no-scrollbar mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
            <CategoryButton active={!selectedCategory} onClick={() => chooseCategory('')} name="All Bytes" />
            {visibleCategories.map((category) => <CategoryButton key={category.id} active={selectedCategory === category.id} onClick={() => chooseCategory(category.id)} name={category.name} />)}
          </div>
          <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
            <p className="text-xs font-bold text-slate-300">Learning mode</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Tap a visual to reveal its title and revision context. Open it for the full study view.</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Designed & developed by Tipu Sultan</p>
          </div>
        </aside>

        <section className="relative min-w-0">
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-[#070b14]/80 px-4 py-3 backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setMobileFilters(true)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 lg:hidden"><Menu className="h-5 w-5" /></button>
              <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-300">Visual learning</p><h1 className="truncate text-base font-black sm:text-lg">{activeCategory?.name ?? 'UPSC Bytes'}</h1></div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={showRecommendations} className={`hidden h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold sm:inline-flex ${recommended ? 'border-blue-400/30 bg-blue-500/15 text-blue-200' : 'border-white/10 bg-white/5 text-slate-300'}`}><Sparkles className="h-4 w-4" /> Study Mix</button>
              <Link href="/search" className="hidden h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 sm:inline-flex"><Search className="h-4 w-4" /> Search</Link>
              <button type="button" onClick={() => fetchFeed('replace', undefined, true)} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Refresh</span></button>
            </div>
          </div>

          <div className="border-b border-white/8 bg-[#0a0f1c]/70 px-4 py-3 sm:px-5">
            <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={postQuery} onChange={(event) => setPostQuery(event.target.value)} placeholder="Search Bytes — Article 21, Parliament, monsoon…" className="w-full rounded-2xl border border-white/8 bg-white/[0.045] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/40 focus:bg-white/[0.07]" /></div>
          </div>

          <section className="feed-scroll no-scrollbar bg-black">
            {displayItems.length === 0 ? (
              <div className="flex min-h-[calc(100dvh-124px)] items-center justify-center p-10 text-center"><div className="max-w-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/8"><Search className="h-6 w-6 text-slate-400" /></div><h2 className="mt-5 text-xl font-black">No Bytes found</h2><p className="mt-2 text-sm leading-6 text-slate-500">Try another search term or choose a different category.</p><button type="button" onClick={() => { setPostQuery(''); chooseCategory(''); }} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-900">Clear filters</button></div></div>
            ) : displayItems.map((post) => <FeedCard key={post.id} post={post} />)}
            <div ref={sentinel} className="flex h-20 items-center justify-center text-xs font-semibold text-slate-600">{loading ? 'Loading more Bytes…' : data.nextCursor ? 'Scroll for more' : 'You reached the end.'}</div>
          </section>
        </section>

        <aside className="sticky top-0 hidden h-[100dvh] flex-col justify-between py-7 pr-5 xl:flex">
          <div>
            <div className="rounded-[28px] border border-white/8 bg-white/[0.035] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Current collection</p>
              <h2 className="mt-2 text-xl font-black">{activeCategory?.name ?? 'All UPSC Bytes'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{activeCategory?.description ?? 'A visual-first stream of concise concepts, facts and revision material for UPSC preparation.'}</p>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/[0.045] px-3 py-2.5 text-xs"><span className="text-slate-500">Loaded Bytes</span><span className="font-black text-slate-200">{data.items.length}</span></div>
            </div>
            <div className="mt-4 rounded-[28px] border border-white/8 bg-white/[0.035] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Quick navigation</p>
              <div className="mt-3 space-y-2"><Link href="/search" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/5"><span>Full search</span><ExternalLink className="h-4 w-4" /></Link></div>
            </div>
          </div>
          <p className="px-2 text-xs leading-5 text-slate-600">UPSC Bytes · Learn visually, revise repeatedly.</p>
        </aside>
      </div>

      {mobileFilters && <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileFilters(false)}><aside className="h-full w-[min(88vw,360px)] border-r border-white/10 bg-[#0a0f1c] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><Brand compact /><button type="button" onClick={() => setMobileFilters(false)} className="rounded-xl p-2 text-slate-400 hover:bg-white/5"><X className="h-5 w-5" /></button></div><div className="mt-8"><p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Search categories</p><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input autoFocus value={categoryQuery} onChange={(event) => setCategoryQuery(event.target.value)} placeholder="Search categories…" className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500" /></div></div><div className="no-scrollbar mt-4 space-y-1 overflow-y-auto"><CategoryButton active={!selectedCategory} onClick={() => chooseCategory('')} name="All Bytes" />{visibleCategories.map((category) => <CategoryButton key={category.id} active={selectedCategory === category.id} onClick={() => chooseCategory(category.id)} name={category.name} />)}</div><p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Designed & developed by Tipu Sultan</p></aside></div>}
    </main>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-[#173b73] text-white shadow-lg shadow-blue-950/30"><BookOpen className="h-5 w-5" /></span><span className={compact ? 'text-base font-black' : 'text-lg font-black tracking-tight'}>UPSC <span className="text-amber-300">Bytes</span></span></Link>;
}

function CategoryButton({ active, name, onClick }: { active: boolean; name: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-bold transition ${active ? 'bg-blue-500/15 text-blue-200 ring-1 ring-inset ring-blue-400/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}><span className="truncate">{name}</span>{active && <ChevronDown className="h-4 w-4 -rotate-90 text-blue-300" />}</button>;
}
