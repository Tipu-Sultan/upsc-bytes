import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware/auth';
import { generateByteAssist } from '@/lib/services/groq.service';
import { fail, ok } from '@/lib/utils/api';

const schema = z.object({
  title: z.string().min(2).max(180),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  category: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = schema.parse(await request.json());
    return ok(await generateByteAssist(input));
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'AI assist failed.', 400);
  }
}
