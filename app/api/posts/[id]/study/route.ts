import { connectDB } from '@/lib/db';
import { getPostById, updatePost } from '@/lib/controllers/post.controller';
import { generateByteStudy } from '@/lib/services/groq.service';
import { fail, ok } from '@/lib/utils/api';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const post = await getPostById(id);
    if (!post || post.status !== 'published') return fail('Not found', 404);
    if (post.aiSummary && post.keyPoints?.length) return ok(post);
    const study = await generateByteStudy({ title: post.title, description: post.description, tags: post.tags, category: post.categoryName });
    await updatePost(id, { aiSummary: study.summary, examAngle: study.examAngle, keyPoints: study.keyPoints, tags: study.tags.length ? study.tags : post.tags });
    const updated = await getPostById(id);
    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Study generation failed.', 400);
  }
}
