import { connectDB } from '@/lib/db';
import { listCategories } from '@/lib/controllers/category.controller';
import { CategoryManager } from '@/components/admin/CategoryManager';
export const dynamic = 'force-dynamic';
export default async function CategoriesAdminPage() { await connectDB(); const rows = await listCategories(true); const categories = rows.map(c=>({id:c._id.toString(),name:c.name,slug:c.slug,description:c.description,coverImage:c.coverImage,isActive:c.isActive})); return <div><h1 className="text-3xl font-black">Categories</h1><div className="mt-6"><CategoryManager initial={categories}/></div></div>; }
