import { connectDB } from '@/lib/db';
import { getPostById } from '@/lib/controllers/post.controller';
import { registerUniqueView } from '@/lib/services/view.service';
import { fail, ok } from '@/lib/utils/api';

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const post = await getPostById(id);
    if (!post || post.status !== 'published') return fail('Not found', 404);

    const views = await registerUniqueView(id, getClientIp(request));
    return ok({ views });
  } catch {
    return fail('Unable to register view.', 500);
  }
}
