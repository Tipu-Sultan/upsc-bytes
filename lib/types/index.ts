export type UserRole = 'admin';
export type PostStatus = 'draft' | 'published';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  isActive: boolean;
}

export interface PostDTO {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  description?: string;
  aiSummary?: string;
  examAngle?: string;
  keyPoints?: string[];
  tags: string[];
  status: PostStatus;
  views: number;
  createdAt: string;
}

export interface FeedResponse {
  items: PostDTO[];
  nextCursor: string | null;
  hasMore: boolean;
}
