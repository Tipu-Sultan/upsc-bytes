import { model, models, Schema, type InferSchemaType } from 'mongoose';

const postViewSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  visitorHash: { type: String, required: true },
  day: { type: String, required: true },
}, { timestamps: true });

postViewSchema.index({ postId: 1, visitorHash: 1, day: 1 }, { unique: true });

export type PostView = InferSchemaType<typeof postViewSchema>;
export const PostViewModel = models.PostView || model('PostView', postViewSchema);
