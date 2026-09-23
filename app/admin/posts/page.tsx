import { connectDB } from "@/lib/db";
import { listCategories } from "@/lib/controllers/category.controller";
import { listAdminPosts } from "@/lib/controllers/post.controller";
import { PostManager } from "@/components/admin/PostManager";
export const dynamic = "force-dynamic";
export default async function PostsAdminPage() {
  await connectDB();
  const [cats, posts] = await Promise.all([listCategories(), listAdminPosts()]);
  const categories = cats.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description,
    coverImage: c.coverImage,
    isActive: c.isActive,
  }));
  return (
    <div>
      <h1 className="text-3xl font-black">Bytes / Posts</h1>
      <div className="mt-6">
        <PostManager categories={categories} initial={posts} />
      </div>
    </div>
  );
}
