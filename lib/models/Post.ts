import { model, models, Schema, type InferSchemaType } from 'mongoose';

const postSchema = new Schema({
  title: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  imageUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: true },
  description: { type: String, trim: true },
  aiSummary: { type: String, trim: true },
  examAngle: { type: String, trim: true },
  keyPoints: { type: [String], default: [] },
  tags: { type: [String], default: [], index: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.index({ title: 'text', description: 'text', tags: 'text' });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ categoryId: 1, status: 1, createdAt: -1 });

export type Post = InferSchemaType<typeof postSchema>;
export const PostModel = models.Post || model('Post', postSchema);
