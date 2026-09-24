'use client';

import Link from 'next/link';
import { BarChart3, BookOpen, FolderTree, LayoutDashboard, LogOut, PlusSquare, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/posts', label: 'Bytes / Posts', icon: PlusSquare },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  ];

  return (
    <aside className="admin-sidebar shrink-0 border-b border-white/10 bg-[#0b1730] p-4 text-white md:sticky md:top-0 md:h-[100dvh] md:border-b-0 md:border-r md:p-5">
      <div className="flex items-center justify-between md:block">
        <Link href="/" className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-[#173b73]"><BookOpen className="h-5 w-5" /></span><span className="text-lg font-black">UPSC <span className="text-amber-300">Bytes</span></span></Link>
        <Link href="/" className="hidden rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5 md:inline-flex">View site</Link>
      </div>
      <div className="mt-7 hidden rounded-2xl bg-white/5 p-4 md:block"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><BarChart3 className="h-5 w-5" /></div><div><p className="text-xs font-bold text-slate-300">Admin Studio</p><p className="mt-0.5 text-[11px] text-slate-500">Manage your visual library</p></div></div></div>
      <nav className="mt-5 grid grid-cols-3 gap-2 md:mt-7 md:grid-cols-1">
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold transition md:justify-start md:text-sm ${pathname === href ? 'bg-blue-500/15 text-blue-200 ring-1 ring-inset ring-blue-400/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</Link>)}
      </nav>
      <div className="mt-4 hidden space-y-2 md:block"><Link href="/search" className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white"><Search className="h-4 w-4" /> Public search</Link></div>
      <button onClick={logout} className="mt-5 hidden w-full items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-left text-sm font-bold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300 md:flex"><LogOut className="h-4 w-4" /> Logout</button>
    </aside>
  );
}
