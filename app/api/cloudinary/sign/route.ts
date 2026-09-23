import { requireAdmin } from '@/lib/middleware/auth';
import { createUploadSignature } from '@/lib/services/cloudinary.service';
import { fail } from '@/lib/utils/api';
import { env } from '@/lib/config/env';

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const paramsToSign = body?.paramsToSign;

    if (!paramsToSign || typeof paramsToSign !== 'object' || Array.isArray(paramsToSign)) {
      return fail('Invalid signing parameters.', 400);
    }

    // Ensure the request targets the expected upload folder
    if (paramsToSign.folder !== 'upsc-bytes') {
      return fail('Invalid upload folder.', 400);
    }

    // Pass paramsToSign directly so all Widget parameters (like `source: 'uw'`) are signed
    const signature = createUploadSignature(paramsToSign);

    return Response.json({
      signature,
      apiKey: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return fail('Unauthorized', 401);
    }

    return fail('Failed to generate Cloudinary signature.', 500);
  }
}