import { connectDB } from '@/lib/db';
import { getCategoryBySlug, listCategories } from '@/lib/controllers/category.controller';
import { listFeed } from '@/lib/controllers/post.controller';
import { Feed } from '@/components/feed/Feed';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const [initial, rows] = await Promise.all([listFeed(undefined, category._id.toString()), listCategories()]);
  const categories = rows.map((item) => ({ id: item._id.toString(), name: item.name, slug: item.slug, description: item.description, coverImage: item.coverImage, isActive: item.isActive }));
  return <Feed initial={initial} categories={categories} initialCategoryId={category._id.toString()} />;
}
