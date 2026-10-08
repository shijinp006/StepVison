import 'server-only';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../env';

const JWT_ALGORITHM = 'HS256';

// A login uses two tokens:
// - the access token: a short-lived JWT sent with every admin request;
// - the refresh token: a long-lived random string, used only to get a new
//   access token when the old one expires. Only its SHA-256 hash is stored.

// What a valid access token carries: the admin id (sub) and the device id
// (did) of the session it belongs to.
export interface AccessTokenPayload {
    sub: string;
    did: string;
}

export const accessTokenTtlMs = () => env.accessTokenTtlMinutes * 60 * 1000;
export const sessionTtlMs = () => env.sessionTtlHours * 60 * 60 * 1000;

export const generateRefreshToken = () => crypto.randomBytes(32).toString('hex');
export const generateDeviceId = () => crypto.randomUUID();
export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export function signAccessToken({ adminId, deviceId }: { adminId: string; deviceId: string }) {
    return jwt.sign({ did: deviceId }, env.jwtSecret, {
        algorithm: JWT_ALGORITHM,
        subject: adminId,
        expiresIn: Math.floor(accessTokenTtlMs() / 1000),
    });
}

// Checks the signature and expiry. Returns the payload, or null if the token
// is missing, tampered with, expired or lacks one of our claims.
export function verifyAccessToken(token: string | null): AccessTokenPayload | null {
    if (!token) return null;

    try {
        const payload = jwt.verify(token, env.jwtSecret, { algorithms: [JWT_ALGORITHM] });
        if (typeof payload === 'string') return null;

        const { sub, did } = payload;
        if (typeof sub !== 'string' || typeof did !== 'string') return null;

        return { sub, did };
    } catch {
        return null;
    }
}
