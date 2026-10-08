import 'server-only';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { configErrors, env } from './env';
import { Admin } from './models/Admin';
import { Product } from './models/Product';
import { Session } from './models/Session';

// Kept on globalThis so hot reloads in development and warm serverless
// starts reuse one connection instead of opening a new one each time.
const cache = globalThis as typeof globalThis & { dbReady?: Promise<void> };

// Connects to MongoDB and creates the admin account, once. Every service
// awaits this before its first query. A failed attempt is retried on the
// next call.
export function connectDB(): Promise<void> {
    if (configErrors.length > 0) {
        return Promise.reject(new Error(configErrors.join(' ')));
    }

    cache.dbReady ??= setUp().catch((err) => {
        cache.dbReady = undefined;
        throw err;
    });
    return cache.dbReady;
}

async function setUp() {
    // Give up well before a serverless request would time out (Vercel: 10s),
    // so the real error is reported instead of a timeout.
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 7000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    await ensureAdmin();
    await upgradeSessions();
    await removeProductPricing();
}

// Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD on first start.
// An existing account is left untouched.
async function ensureAdmin() {
    if (await Admin.exists({ email: env.adminEmail })) return;

    const passwordHash = await bcrypt.hash(env.adminPassword, 12);
    await Admin.create({ email: env.adminEmail, passwordHash });
    console.log(`Admin account created for ${env.adminEmail}`);
}

// Logins made before refresh tokens were added have no refresh token and
// cannot be refreshed, so they are removed (those admins sign in once more).
// syncIndexes() then drops the old sessionHash index and builds the new ones.
async function upgradeSessions() {
    const { deletedCount } = await Session.deleteMany({ refreshTokenHash: { $exists: false } });
    if (deletedCount > 0) {
        console.log(`Removed ${deletedCount} old login session(s)`);
    }
    await Session.syncIndexes();
}

// Products no longer have a price or stock quantity, so strip those fields
// from products saved before they were removed. Uses the raw collection
// because Mongoose ignores updates to fields that are not in the schema.
async function removeProductPricing() {
    const { modifiedCount } = await Product.collection.updateMany(
        { $or: [{ price: { $exists: true } }, { quantity: { $exists: true } }] },
        { $unset: { price: '', quantity: '' } }
    );
    if (modifiedCount > 0) {
        console.log(`Removed price and quantity from ${modifiedCount} product(s)`);
    }
}
