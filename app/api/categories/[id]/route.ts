import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { updateCategory, deleteCategory } from '@/lib/controllers/category.controller';
import { requireAdmin } from '@/lib/middleware/auth';
import { fail, ok } from '@/lib/utils/api';
const schema=z.object({name:z.string().min(2).max(100),description:z.string().max(500).optional(),coverImage:z.string().url().optional(),isActive:z.boolean().optional()});
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){try{await requireAdmin();await connectDB();const {id}=await params;const c=await updateCategory(id,schema.parse(await request.json()));if(!c)return fail('Category not found',404);revalidatePath('/', 'page');revalidatePath('/category/[slug]', 'page');revalidatePath('/admin', 'page');revalidatePath('/admin/categories', 'page');return ok({id:c._id.toString(),name:c.name,slug:c.slug,description:c.description,coverImage:c.coverImage,isActive:c.isActive});}catch(e){return fail(e instanceof Error?e.message:'Failed');}}
export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){try{await requireAdmin();await connectDB();const {id}=await params;await deleteCategory(id);revalidatePath('/', 'page');revalidatePath('/category/[slug]', 'page');revalidatePath('/admin', 'page');revalidatePath('/admin/categories', 'page');return ok({deleted:true});}catch(e){return fail(e instanceof Error?e.message:'Failed');}}
