import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { getPostBySlug } from '@/lib/controllers/post.controller';
import { ByteStudyView } from '@/components/feed/ByteStudyView';

export const revalidate = 60;

export default async function BytePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  return <ByteStudyView post={post} />;
}
