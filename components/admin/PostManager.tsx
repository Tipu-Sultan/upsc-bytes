'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { Bot, ImagePlus, Loader2, Pencil, Save, Sparkles, Trash2, UploadCloud, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { CategoryDTO, PostDTO } from '@/lib/types';
import { broadcastContentChange } from '@/lib/client/feed-store';

type UploadInfo = { secure_url?: string; public_id?: string };

type FormState = {
  id?: string;
  title: string;
  categoryId: string;
  description: string;
  aiSummary: string;
  examAngle: string;
  keyPoints: string;
  tags: string;
  imageUrl: string;
  publicId: string;
  status: 'draft' | 'published';
};

const emptyForm = (categoryId = ''): FormState => ({ id: undefined, title: '', categoryId, description: '', aiSummary: '', examAngle: '', keyPoints: '', tags: '', imageUrl: '', publicId: '', status: 'published' });

export function PostManager({ categories, initial }: { categories: CategoryDTO[]; initial: PostDTO[] }) {
  const [posts, setPosts] = useState(initial);
  const [form, setForm] = useState<FormState>(() => emptyForm(categories[0]?.id ?? ''));
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  const editing = Boolean(form.id);
  const currentCategory = useMemo(() => categories.find((category) => category.id === form.categoryId)?.name, [categories, form.categoryId]);

  function patch(next: Partial<FormState>) { setForm((current) => ({ ...current, ...next })); }
  function resetForm() { setForm(emptyForm(categories[0]?.id ?? '')); }

  async function save() {
    if (!form.title.trim() || !form.categoryId || !form.imageUrl || !form.publicId) {
      toast.error('Please add a title, category and visual before saving.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(), categoryId: form.categoryId, imageUrl: form.imageUrl,
        cloudinaryPublicId: form.publicId, description: form.description.trim(),
        aiSummary: form.aiSummary.trim(),
        examAngle: form.examAngle.trim(),
        keyPoints: form.keyPoints.split('\n').map((point) => point.trim()).filter(Boolean),
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), status: form.status,
      };
      const response = await fetch(form.id ? `/api/posts/${form.id}` : '/api/posts', {
        method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error ?? 'Failed to save Byte.');

      const saved: PostDTO = {
        ...data.data,
        id: data.data.id ?? form.id,
        categoryName: currentCategory ?? '',
        categorySlug: categories.find((category) => category.id === form.categoryId)?.slug ?? '',
        tags: payload.tags,
        description: payload.description,
        aiSummary: payload.aiSummary,
        examAngle: payload.examAngle,
        keyPoints: payload.keyPoints,
        imageUrl: payload.imageUrl,
        cloudinaryPublicId: payload.cloudinaryPublicId,
        title: payload.title,
        status: payload.status,
      };
      setPosts((current) => form.id ? current.map((post) => post.id === form.id ? { ...post, ...saved } : post) : [saved, ...current]);
      toast.success(form.id ? 'Byte updated.' : 'Byte published successfully.');
      resetForm();
      broadcastContentChange();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save Byte.');
    } finally { setBusy(false); }
  }

  function edit(post: PostDTO) {
    setForm({ id: post.id, title: post.title, categoryId: post.categoryId, description: post.description ?? '', aiSummary: post.aiSummary ?? '', examAngle: post.examAngle ?? '', keyPoints: (post.keyPoints ?? []).join('\n'), tags: post.tags.join(', '), imageUrl: post.imageUrl, publicId: post.cloudinaryPublicId, status: post.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this Byte permanently? The linked Cloudinary image will also be deleted.')) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error ?? 'Failed to delete Byte.');
      setPosts((current) => current.filter((post) => post.id !== id));
      if (form.id === id) resetForm();
      broadcastContentChange();
      toast.success('Byte and its Cloudinary image were deleted.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete Byte.');
    } finally { setBusy(false); }
  }

  async function aiAssist() {
    if (!form.title.trim()) { toast.error('Add a title before using AI Assist.'); return; }
    setAiBusy(true);
    try {
      const response = await fetch('/api/ai/assist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title.trim(), description: form.description.trim(), tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean), category: currentCategory }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error ?? 'AI Assist failed.');
      patch({ description: data.data.summary, aiSummary: data.data.summary, examAngle: data.data.examAngle, keyPoints: data.data.keyPoints.join('\n'), tags: data.data.tags.join(', ') });
      toast.success('Groq generated a concise summary and search tags.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI Assist failed.');
    } finally { setAiBusy(false); }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#102f5e] to-[#173b73] px-6 py-7 text-white md:px-8">
          <div className="flex items-start justify-between gap-5">
            <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100"><ImagePlus className="h-3.5 w-3.5" /> Visual publisher</div><h2 className="text-2xl font-black tracking-tight md:text-3xl">{editing ? 'Edit UPSC Byte' : 'Create a new UPSC Byte'}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80">Keep the feed visual-first. Titles, summaries and tags stay available in the focused study view.</p></div>
            {editing && <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"><X className="h-4 w-4" /> Cancel edit</button>}
          </div>
        </div>

        <div className="grid gap-7 p-6 md:grid-cols-[1fr_320px] md:p-8">
          <div className="space-y-5">
            <Field label="Byte title"><input value={form.title} onChange={(event) => patch({ title: event.target.value })} placeholder="e.g. Article 21 — Right to Life" className={inputClass} /></Field>
            <Field label="Category"><select value={form.categoryId} onChange={(event) => patch({ categoryId: event.target.value })} className={inputClass}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
            <Field label="Short description"><textarea value={form.description} onChange={(event) => patch({ description: event.target.value })} rows={4} placeholder="A concise factual explanation for the study view…" className={`${inputClass} resize-none`} /></Field>
            <Field label="Groq study summary"><textarea value={form.aiSummary} onChange={(event) => patch({ aiSummary: event.target.value })} rows={4} placeholder="AI-generated explanation shown on the dedicated study page…" className={`${inputClass} resize-none`} /></Field>
            <Field label="UPSC exam angle"><textarea value={form.examAngle} onChange={(event) => patch({ examAngle: event.target.value })} rows={3} placeholder="How this helps Prelims/Mains…" className={`${inputClass} resize-none`} /></Field>
            <Field label="Key revision points"><textarea value={form.keyPoints} onChange={(event) => patch({ keyPoints: event.target.value })} rows={5} placeholder="One revision point per line" className={`${inputClass} resize-none`} /></Field>
            <div><div className="mb-2 flex items-center justify-between"><label className="block text-sm font-bold text-slate-700">Tags</label><button type="button" onClick={aiAssist} disabled={aiBusy} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] font-black text-violet-700 hover:bg-violet-100 disabled:opacity-50">{aiBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />} AI Assist</button></div><input value={form.tags} onChange={(event) => patch({ tags: event.target.value })} placeholder="polity, constitution, article 21" className={inputClass} /><p className="mt-2 text-xs text-slate-400">Groq can generate concise tags and a summary; review before publishing.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><select value={form.status} onChange={(event) => patch({ status: event.target.value as FormState['status'] })} className={inputClass + ' sm:w-auto'}><option value="published">Publish immediately</option><option value="draft">Save as draft</option></select><button type="button" onClick={save} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#173b73] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#102f5e] disabled:cursor-not-allowed disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{busy ? 'Saving…' : editing ? 'Update Byte' : 'Save Byte'}</button></div>
          </div>

          <div><label className="mb-2 block text-sm font-bold text-slate-700">Visual</label><CldUploadWidget signatureEndpoint="/api/cloudinary/sign" options={{ folder: 'upsc-bytes', resourceType: 'image', multiple: false, maxFiles: 1, clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'], maxFileSize: 10_000_000, showCompletedButton: true, showUploadMoreButton: false, singleUploadAutoClose: false, autoMinimize: false, sources: ['local', 'url'] }} onSuccess={(result) => { const info = result.info as UploadInfo; if (info.secure_url && info.public_id) { patch({ imageUrl: info.secure_url, publicId: info.public_id }); toast.success('Image uploaded to Cloudinary.'); } }} onError={(error) => toast.error(typeof error === 'string' ? error : 'Cloudinary upload failed.')}>
              {({ open }) => <button type="button" onClick={() => open()} className="group relative flex min-h-[380px] w-full overflow-hidden rounded-[24px] border border-dashed border-slate-300 bg-slate-50 text-left transition hover:border-blue-400 hover:bg-blue-50/30">{form.imageUrl ? <><img src={form.imageUrl} alt="Uploaded Byte preview" className="absolute inset-0 h-full w-full bg-slate-950 object-contain" /><span className="absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-2xl bg-black/70 px-4 py-3 text-sm font-bold text-white backdrop-blur">Change image</span></> : <span className="m-auto flex max-w-[230px] flex-col items-center text-center"><span className="mb-4 rounded-2xl bg-white p-4 text-[#173b73] shadow-sm"><UploadCloud className="h-7 w-7" /></span><span className="text-base font-black text-slate-800">Upload your infographic</span><span className="mt-2 text-sm leading-5 text-slate-500">JPG, PNG or WebP · max 10 MB</span><span className="mt-5 rounded-full bg-[#173b73] px-4 py-2.5 text-xs font-black text-white">Open Cloudinary</span></span>}</button>}
            </CldUploadWidget></div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 md:px-8"><div><h3 className="text-xl font-black text-slate-900">Byte library</h3><p className="mt-1 text-sm text-slate-500">Edit published or draft Bytes without leaving the admin page.</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{posts.length} total</span></div>
        <div className="divide-y divide-slate-100">{posts.map((post) => <div key={post.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center md:px-8"><div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100"><img src={post.imageUrl} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><p className="truncate font-bold text-slate-900">{post.title}</p><p className="mt-1 text-xs font-semibold text-[#173b73]">{post.categoryName}</p><p className="mt-1 text-xs text-slate-400">{post.views.toLocaleString('en-IN')} views · {post.status}</p></div><div className="flex gap-2"><button type="button" onClick={() => edit(post)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit</button><button type="button" onClick={() => remove(post.id)} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete</button></div></div>)}{!posts.length && <div className="px-8 py-12 text-center text-sm text-slate-500">No Bytes have been created yet.</div>}</div>
      </section>

      <div className="flex items-center justify-center gap-2 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400"><Sparkles className="h-3.5 w-3.5" /> Design & Developed By: Tipu Sultan</div>
    </div>
  );
}

const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#173b73] focus:bg-white focus:ring-4 focus:ring-blue-100';
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>{children}</div>; }
