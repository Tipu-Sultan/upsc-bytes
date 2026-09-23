import type { FeedResponse } from '@/lib/types';

const feedCache = new Map<string, FeedResponse>();
const CONTENT_EVENT = 'upsc-bytes:content-changed';
const CONTENT_KEY = 'upsc-bytes:content-version';

export function feedCacheKey(categoryId = '', query = '') {
  return `${categoryId || 'all'}::${query.trim().toLowerCase() || 'all'}`;
}

export function getCachedFeed(key: string) {
  return feedCache.get(key);
}

export function setCachedFeed(key: string, value: FeedResponse) {
  feedCache.set(key, value);
}

export function clearFeedCache() {
  feedCache.clear();
}

export function broadcastContentChange() {
  if (typeof window === 'undefined') return;
  clearFeedCache();
  window.dispatchEvent(new Event(CONTENT_EVENT));
  try {
    localStorage.setItem(CONTENT_KEY, String(Date.now()));
  } catch {
    // Storage can be unavailable in private/restricted browsing modes.
  }
}

export function subscribeToContentChanges(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  const onEvent = () => callback();
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONTENT_KEY) callback();
  };
  window.addEventListener(CONTENT_EVENT, onEvent);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CONTENT_EVENT, onEvent);
    window.removeEventListener('storage', onStorage);
  };
}
