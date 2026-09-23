import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/lib/services/auth.service';
import { fail, ok } from '@/lib/utils/api';
export async function GET(){try{const token=(await cookies()).get('upsc_bytes_token')?.value;if(!token)return fail('Unauthorized',401);return ok(await verifyAuthToken(token));}catch{return fail('Unauthorized',401);}}
