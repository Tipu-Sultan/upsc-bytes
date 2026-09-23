import mongoose from 'mongoose';
import { env } from '@/lib/config/env';

const globalForMongoose = globalThis as unknown as { mongoosePromise?: Promise<typeof mongoose> };

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!globalForMongoose.mongoosePromise) {
    globalForMongoose.mongoosePromise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }).catch((error) => {
      globalForMongoose.mongoosePromise = undefined;
      throw error;
    });
  }
  await globalForMongoose.mongoosePromise;
  return mongoose;
}
