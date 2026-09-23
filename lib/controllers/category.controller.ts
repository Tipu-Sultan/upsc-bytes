import { CategoryModel } from '@/lib/models/Category';
import { slugify } from '@/lib/utils/slug';

export async function listCategories(includeInactive = false) {
  const query = includeInactive ? {} : { isActive: true };
  return CategoryModel.find(query).sort({ name: 1 }).lean();
}

export async function getCategoryBySlug(slug: string) {
  return CategoryModel.findOne({ slug, isActive: true }).lean();
}

export async function createCategory(input: { name: string; description?: string; coverImage?: string }) {
  const slug = slugify(input.name);
  return CategoryModel.create({ ...input, slug });
}

export async function updateCategory(id: string, input: { name: string; description?: string; coverImage?: string; isActive?: boolean }) {
  const slug = slugify(input.name);
  return CategoryModel.findByIdAndUpdate(id, { ...input, slug }, { new: true, runValidators: true }).lean();
}

export async function deleteCategory(id: string) {
  return CategoryModel.findByIdAndDelete(id);
}
