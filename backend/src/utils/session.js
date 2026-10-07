import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const TOKEN_COOKIE = 'sv_token';
// Cookies from the previous session-id scheme; cleared on logout so old browsers tidy up.
const LEGACY_COOKIES = ['sv_sid', 'sv_did'];

const JWT_ALGORITHM = 'HS256';

export const generateTokenId = () => crypto.randomBytes(32).toString('hex');
export const generateDeviceId = () => crypto.randomUUID();
export const hashTokenId = (tokenId) => crypto.createHash('sha256').update(tokenId).digest('hex');

export const sessionTtlMs = () => env.sessionTtlHours * 60 * 60 * 1000;

// The JWT carries the admin id, the device id and a random token id (jti).
// The token id is also stored (hashed) in the Session collection so a
// logout can revoke the token before it expires.
export function signAccessToken({ adminId, deviceId, tokenId }) {
    return jwt.sign({ did: deviceId }, env.jwtSecret, {
        algorithm: JWT_ALGORITHM,
        subject: String(adminId),
        jwtid: tokenId,
        expiresIn: Math.floor(sessionTtlMs() / 1000),
    });
}

// Returns the decoded payload, or null if the token is missing, tampered with or expired.
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, env.jwtSecret, { algorithms: [JWT_ALGORITHM] });
    } catch {
        return null;
    }
}

// Accepts the token from the httpOnly cookie, or from an "Authorization: Bearer" header.
export function readAccessToken(req) {
    const header = req.get('authorization') || '';
    if (header.startsWith('Bearer ')) return header.slice(7).trim();
    return req.cookies?.[TOKEN_COOKIE] || null;
}

const cookieOptions = () => ({
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
});

export function setTokenCookie(res, token) {
    res.cookie(TOKEN_COOKIE, token, { ...cookieOptions(), maxAge: sessionTtlMs() });
}

export function clearTokenCookie(res) {
    res.clearCookie(TOKEN_COOKIE, cookieOptions());
    for (const name of LEGACY_COOKIES) res.clearCookie(name, cookieOptions());
}
