import { connectDB } from '@/lib/db';
import { listFeed } from '@/lib/controllers/post.controller';
import { ok } from '@/lib/utils/api';
export async function GET(request:Request){await connectDB();const q=new URL(request.url).searchParams.get('q')||'';if(!q.trim())return ok({items:[],nextCursor:null,hasMore:false});return ok(await listFeed(undefined,undefined,q));}
