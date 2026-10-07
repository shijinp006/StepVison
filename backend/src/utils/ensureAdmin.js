import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';

// Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD on first start.
// An existing account is left untouched.
export async function ensureAdmin() {
    const existing = await Admin.findOne({ email: env.adminEmail });
    if (existing) return;

    const passwordHash = await bcrypt.hash(env.adminPassword, 12);
    await Admin.create({ email: env.adminEmail, passwordHash });
    console.log(`Admin account created for ${env.adminEmail}`);
}
