import mongoose, { InferSchemaType } from 'mongoose';
import { compileModel } from './compileModel';

// One document per logged-in device. Created on login, deleted on logout.
// Only SHA-256 hashes of refresh tokens are stored, so a database leak does
// not expose usable tokens.
const sessionSchema = new mongoose.Schema(
    {
        deviceId: { type: String, required: true, unique: true },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
        // The refresh token that is valid right now. It changes on every refresh.
        refreshTokenHash: { type: String, required: true, unique: true },
        // The one it replaced, kept to spot a stolen refresh token being reused.
        previousRefreshTokenHash: { type: String, index: true, sparse: true },
        refreshedAt: { type: Date },
        userAgent: { type: String, default: '' },
        ip: { type: String, default: '' },
        lastSeenAt: { type: Date, default: Date.now },
        // MongoDB removes the document automatically once this date passes.
        expiresAt: { type: Date, required: true, index: { expires: 0 } },
    },
    { timestamps: true }
);

export type SessionFields = InferSchemaType<typeof sessionSchema>;

export const Session = compileModel<SessionFields>('Session', sessionSchema);
