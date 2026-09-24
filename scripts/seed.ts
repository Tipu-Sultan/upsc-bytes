import 'dotenv/config';
import { connectDB } from '@/lib/db';
import { CategoryModel } from '@/lib/models/Category';
import { UserModel } from '@/lib/models/User';
import { hashPassword } from '@/lib/services/auth.service';
import { slugify } from '@/lib/utils/slug';

async function main(){
  await connectDB();
  const email=process.env.ADMIN_EMAIL || 'admin@upscbytes.com';
  const password=process.env.ADMIN_PASSWORD || 'change-this-password';
  const existing=await UserModel.findOne({email});
  if(!existing) await UserModel.create({name:'UPSC Bytes Admin',email,passwordHash:await hashPassword(password),role:'admin'});
  const categories=['Know Your Constitution','Polity','History','Geography','Economy','Environment','Science & Technology','Current Affairs'];
  for(const name of categories) await CategoryModel.updateOne({slug:slugify(name)},{$setOnInsert:{name,slug:slugify(name),description:`${name} visual learning Bytes.`}},{upsert:true});
  console.log('Seed complete. Admin:',email);
  process.exit(0);
}
main().catch((error)=>{console.error(error);process.exit(1);});
