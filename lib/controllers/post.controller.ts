import { Types } from 'mongoose';
import { PostModel } from '@/lib/models/Post';
import { PostViewModel } from '@/lib/models/PostView';
import { CategoryModel } from '@/lib/models/Category';
import { slugify } from '@/lib/utils/slug';
import type { FeedResponse } from '@/lib/types';

const PAGE_SIZE = 8;

function mapPost(post: any): any {
  return {
    id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    categoryId: post.categoryId?._id?.toString() ?? post.categoryId?.toString(),
    categoryName: post.categoryId?.name ?? '',
    categorySlug: post.categoryId?.slug ?? '',
    imageUrl: post.imageUrl,
    cloudinaryPublicId: post.cloudinaryPublicId,
    description: post.description,
    tags: post.tags ?? [],
    status: post.status,
    views: post.views ?? 0,
    createdAt: new Date(post.createdAt).toISOString(),
  };
}

export async function listFeed(cursor?: string, categoryId?: string, search?: string): Promise<FeedResponse> {
  const filter: Record<string, any> = { status: 'published' };
  if (categoryId && Types.ObjectId.isValid(categoryId)) filter.categoryId = new Types.ObjectId(categoryId);
  if (search?.trim()) filter.$text = { $search: search.trim() };
  if (cursor) filter.createdAt = { $lt: new Date(cursor) };

  const rows = await PostModel.find(filter)
    .populate('categoryId', 'name slug')
    .sort({ createdAt: -1 })
    .limit(PAGE_SIZE + 1)
    .lean();

  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE).map(mapPost);
  const nextCursor = hasMore && items.length ? items[items.length - 1].createdAt : null;
  return { items, nextCursor, hasMore };
}

export async function getPostBySlug(slug: string) {
  const post = await PostModel.findOne({ slug, status: 'published' }).populate('categoryId', 'name slug').lean();
  return post ? mapPost(post) : null;
}

export async function getPostById(id: string) {
  const post = await PostModel.findById(id).populate('categoryId', 'name slug').lean();
  return post ? mapPost(post) : null;
}

export async function createPost(input: {
  title: string; categoryId: string; imageUrl: string; cloudinaryPublicId: string;
  description?: string; tags?: string[]; status?: 'draft' | 'published';
}) {
  const category = await CategoryModel.findById(input.categoryId).lean();
  if (!category) throw new Error('CATEGORY_NOT_FOUND');
  const slug = slugify(input.title);
  return PostModel.create({ ...input, slug, tags: input.tags ?? [] });
}

export async function updatePost(id: string, input: Partial<{
  title: string; categoryId: string; imageUrl: string; cloudinaryPublicId: string;
  description: string; tags: string[]; status: 'draft' | 'published';
}>) {
  if (input.categoryId) {
    const category = await CategoryModel.findById(input.categoryId).lean();
    if (!category) throw new Error('CATEGORY_NOT_FOUND');
  }
  const update: any = { ...input };
  if (input.title) update.slug = slugify(input.title);
  return PostModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
}

export async function deletePost(id: string) {
  const deleted = await PostModel.findByIdAndDelete(id).lean();
  if (deleted) await PostViewModel.deleteMany({ postId: deleted._id });
  return deleted;
}

export async function listAdminPosts() {
  const posts = await PostModel.find().populate('categoryId', 'name slug').sort({ createdAt: -1 }).lean();
  return posts.map(mapPost);
}
