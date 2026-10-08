import 'server-only';
import bcrypt from 'bcryptjs';
import type { AdminSessionInfo } from '@/data/adminTypes';
import { startSession } from '../auth/session';
import { connectDB } from '../db';
import { HttpError } from '../errors';
import { Admin } from '../models/Admin';
import type { LoginInput } from '../schemas/auth';

export async function loginAdmin({ email, password }: LoginInput): Promise<AdminSessionInfo> {
    await connectDB();

    const admin = await Admin.findOne({ email }).lean();
    const passwordOk = admin && (await bcrypt.compare(password, admin.passwordHash));
    if (!passwordOk) {
        throw new HttpError(401, 'Invalid email or password');
    }

    return startSession(admin);
}
