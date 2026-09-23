import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { createPost, getPostById, listFeed } from '@/lib/controllers/post.controller';
import { requireAdmin } from '@/lib/middleware/auth';
import { fail, ok } from '@/lib/utils/api';

const schema = z.object({ title: z.string().min(2).max(180), categoryId: z.string().min(1), imageUrl: z.string().url(), cloudinaryPublicId: z.string().min(1), description: z.string().max(1000).optional(), tags: z.array(z.string().max(50)).max(20).optional(), status: z.enum(['draft', 'published']).optional() });

function invalidatePublic() {
  revalidatePath('/', 'page');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/byte/[slug]', 'page');
  revalidatePath('/admin', 'page');
  revalidatePath('/admin/posts', 'page');
}

export async function GET(request: Request) {
  await connectDB();
  const url = new URL(request.url);
  return ok(await listFeed(url.searchParams.get('cursor') || undefined, url.searchParams.get('categoryId') || undefined, url.searchParams.get('q') || undefined));
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const created = await createPost(schema.parse(await request.json()));
    const post = await getPostById(created._id.toString());
    invalidatePublic();
    return ok(post, { status: 201 });
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed');
  }
}
