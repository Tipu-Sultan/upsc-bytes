import { model, models, Schema, type InferSchemaType } from 'mongoose';

const categorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, trim: true },
  coverImage: { type: String },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

export type Category = InferSchemaType<typeof categorySchema>;
export const CategoryModel = models.Category || model('Category', categorySchema);
