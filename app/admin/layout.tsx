import { AdminNav } from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/middleware/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try { await requireAdmin(); } catch { redirect('/login'); }
  return <div className="admin-shell flex flex-col bg-[#f4f7fb] md:flex-row"><AdminNav /><main className="min-w-0 flex-1 p-4 md:p-8">{children}</main></div>;
}
