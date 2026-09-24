import crypto from 'node:crypto';
import { PostModel } from '@/lib/models/Post';
import { PostViewModel } from '@/lib/models/PostView';
import { env } from '@/lib/config/env';

function visitorHash(ip: string) {
  return crypto.createHash('sha256').update(`${env.JWT_SECRET}:${ip}`).digest('hex');
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function registerUniqueView(postId: string, ip: string) {
  const hash = visitorHash(ip || 'unknown');
  const day = dayKey();

  try {
    await PostViewModel.create({ postId, visitorHash: hash, day });
  } catch (error: any) {
    if (error?.code === 11000) {
      const current = await PostModel.findById(postId).select('views').lean();
      return current?.views ?? 0;
    }
    throw error;
  }

  const updated = await PostModel.findOneAndUpdate(
    { _id: postId, status: 'published' },
    { $inc: { views: 1 } },
    { new: true, select: 'views' },
  ).lean();

  return updated?.views ?? 0;
}
