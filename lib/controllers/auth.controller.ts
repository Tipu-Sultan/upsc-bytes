import { UserModel } from '@/lib/models/User';
import { comparePassword, createAuthToken } from '@/lib/services/auth.service';

export async function loginAdmin(email: string, password: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase(), role: 'admin' }).lean();
  if (!user || !(await comparePassword(password, user.passwordHash))) throw new Error('INVALID_CREDENTIALS');
  const token = await createAuthToken(user._id.toString(), user.role);
  return { token, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } };
}
