import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/lib/config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function createUploadSignature(params: Record<string, any>) {
  return cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}
