import { cookies } from 'next/headers';
import { ok } from '@/lib/utils/api';
export async function POST(){const store=await cookies();store.delete('upsc_bytes_token');return ok({loggedOut:true});}
