import Link from 'next/link';

export default function OfflinePage() {
  return <main className="grid min-h-screen place-items-center bg-[#070b14] px-6 text-center text-white"><div className="max-w-md"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-2xl">📚</div><h1 className="mt-5 text-3xl font-black">You are offline</h1><p className="mt-3 text-sm leading-6 text-slate-400">Previously visited UPSC Bytes pages can still be available. Reconnect to load fresh content.</p><Link href="/" className="mt-6 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950">Try again</Link><p className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Design & Developed By: Tipu Sultan</p></div></main>;
}
