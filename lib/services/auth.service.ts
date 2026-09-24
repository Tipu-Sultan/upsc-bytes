import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/config/env';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAuthToken(userId: string, role: string) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return { userId: payload.sub as string, role: payload.role as string };
}
