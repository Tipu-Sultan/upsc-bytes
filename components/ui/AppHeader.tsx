'use client';

import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/admin')) return null;
  return <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6"><Link href="/" className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#173b73] text-white shadow-lg shadow-blue-900/15"><BookOpen className="h-4 w-4" /></span><span className="text-lg font-black tracking-tight text-slate-900">UPSC <span className="text-[#d99f00]">Bytes</span></span></Link><nav className="flex items-center gap-1 text-sm font-bold text-slate-600"><Link href="/" className="hidden rounded-xl px-3 py-2 transition hover:bg-slate-100 sm:inline-flex">Home</Link><Link href="/search" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-slate-100"><Search className="h-4 w-4" /><span className="hidden sm:inline">Search</span></Link></nav></div></header>;
}
