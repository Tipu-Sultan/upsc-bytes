import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { deletePost, getPostById, updatePost } from '@/lib/controllers/post.controller';
import { requireAdmin } from '@/lib/middleware/auth';
import { deleteImage } from '@/lib/services/cloudinary.service';
import { fail, ok } from '@/lib/utils/api';

const schema = z.object({
  title: z.string().min(2).max(180).optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  cloudinaryPublicId: z.string().optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(['draft', 'published']).optional(),
});

function invalidatePublic() {
  revalidatePath('/', 'page');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/byte/[slug]', 'page');
  revalidatePath('/admin', 'page');
  revalidatePath('/admin/posts', 'page');
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return fail('Not found', 404);
  return ok(post);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const input = schema.parse(await request.json());
    const before = await getPostById(id);
    if (!before) return fail('Not found', 404);

    const updated = await updatePost(id, input);
    if (!updated) return fail('Not found', 404);
    const post = await getPostById(id);
    if (!post) return fail('Not found', 404);

    if (input.cloudinaryPublicId && input.cloudinaryPublicId !== before.cloudinaryPublicId) {
      try {
        await deleteImage(before.cloudinaryPublicId);
      } catch (error) {
        console.error('Failed to delete replaced Cloudinary image:', error);
      }
    }

    invalidatePublic();
    return ok(post);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed');
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const post = await getPostById(id);
    if (!post) return fail('Not found', 404);

    try {
      await deleteImage(post.cloudinaryPublicId);
    } catch (error) {
      console.error('Cloudinary deletion failed:', error);
      return fail('Cloudinary image could not be deleted, so the Byte was kept.', 502);
    }

    const deleted = await deletePost(id);
    if (!deleted) return fail('Not found', 404);

    invalidatePublic();
    return ok({ deleted: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed');
  }
}
