import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { createCategory, listCategories } from '@/lib/controllers/category.controller';
import { requireAdmin } from '@/lib/middleware/auth';
import { fail, ok } from '@/lib/utils/api';
const schema=z.object({name:z.string().min(2).max(100),description:z.string().max(500).optional(),coverImage:z.string().url().optional()});
export async function GET(){await connectDB();const rows=await listCategories();return ok(rows.map(c=>({id:c._id.toString(),name:c.name,slug:c.slug,description:c.description,coverImage:c.coverImage,isActive:c.isActive})));}
export async function POST(request:Request){try{await requireAdmin();await connectDB();const input=schema.parse(await request.json());const c=await createCategory(input);revalidatePath('/', 'page');revalidatePath('/category/[slug]', 'page');revalidatePath('/admin', 'page');revalidatePath('/admin/categories', 'page');return ok({id:c._id.toString(),name:c.name,slug:c.slug,description:c.description,coverImage:c.coverImage,isActive:c.isActive},{status:201});}catch(e){return fail(e instanceof Error?e.message:'Failed',400);}}
