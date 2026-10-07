import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
    // Give up well before a serverless request would time out (Vercel: 10s),
    // so the real error is reported instead of a timeout.
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 7000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}
