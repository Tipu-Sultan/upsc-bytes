import { z } from 'zod';
import { loginAdmin } from '@/lib/controllers/auth.controller';
import { fail, ok } from '@/lib/utils/api';
import { cookies } from 'next/headers';
const schema=z.object({email:z.string().email(),password:z.string().min(1)});
export async function POST(request:Request){try{const input=schema.parse(await request.json());const result=await loginAdmin(input.email,input.password);const store=await cookies();store.set('upsc_bytes_token',result.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});return ok(result.user);}catch(e){return fail(e instanceof Error&&e.message==='INVALID_CREDENTIALS'?'Invalid email or password':'Invalid request',401);}}
