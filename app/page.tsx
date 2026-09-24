import { connectDB } from '@/lib/db';
import { listCategories } from '@/lib/controllers/category.controller';
import { listFeed } from '@/lib/controllers/post.controller';
import { Feed } from '@/components/feed/Feed';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  await connectDB();
  const [initial, rows] = await Promise.all([listFeed(), listCategories()]);
  const categories = rows.map((category) => ({ id: category._id.toString(), name: category.name, slug: category.slug, description: category.description, coverImage: category.coverImage, isActive: category.isActive }));
  return <Feed initial={initial} categories={categories} />;
}
