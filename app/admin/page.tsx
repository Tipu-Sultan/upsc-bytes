import { connectDB } from '@/lib/db';
import { listCategories } from '@/lib/controllers/category.controller';
import { listAdminPosts } from '@/lib/controllers/post.controller';
import Link from 'next/link';
import { ArrowRight, Eye, FileImage, FolderTree, PlusSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await connectDB();
  const [categories, posts] = await Promise.all([listCategories(true), listAdminPosts()]);
  const published = posts.filter((post) => post.status === 'published').length;
  const views = posts.reduce((total, post) => total + post.views, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[#102f5e] via-[#173b73] to-[#0f274d] p-7 text-white shadow-2xl shadow-blue-950/10 md:p-9">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Content command center</p><h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Build the UPSC Bytes library.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/75">Create visual learning cards, organise them by category and publish them into the full-screen learner feed.</p></div><Link href="/admin/posts" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-[#173b73] transition hover:bg-blue-50">Create Byte <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={FolderTree} label="Categories" value={categories.length} />
        <Stat icon={FileImage} label="Total Bytes" value={posts.length} />
        <Stat icon={PlusSquare} label="Published" value={published} />
        <Stat icon={Eye} label="Total views" value={views.toLocaleString('en-IN')} />
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-black text-slate-900">Recent Bytes</h2><p className="mt-1 text-sm text-slate-500">Your latest visual content.</p></div><Link href="/admin/posts" className="text-sm font-black text-[#173b73]">Manage all</Link></div>
        <div className="mt-6 divide-y divide-slate-100">{posts.slice(0, 6).map((post) => <div key={post.id} className="flex items-center gap-4 py-4"><div className="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100"><img src={post.imageUrl} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-900">{post.title}</p><p className="mt-1 text-xs text-slate-500">{post.categoryName} · {post.views} views</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${post.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{post.status}</span></div>)}{!posts.length && <p className="py-8 text-sm text-slate-500">No Bytes yet. Create your first visual.</p>}</div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string | number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#173b73]"><Icon className="h-4 w-4" /></span></div><p className="mt-4 text-3xl font-black text-slate-900">{value}</p></div>;
}
