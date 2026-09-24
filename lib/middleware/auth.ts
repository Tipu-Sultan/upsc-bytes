import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/services/auth.service';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('upsc_bytes_token')?.value;
  if (!token) throw new Error('UNAUTHORIZED');
  const session = await verifyAuthToken(token);
  if (session.role !== 'admin') throw new Error('FORBIDDEN');
  return session;
}
