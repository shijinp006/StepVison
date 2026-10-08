import 'server-only';
import type { Types } from 'mongoose';
import { cookies, headers } from 'next/headers';
import type { AdminSessionInfo } from '@/data/adminTypes';
import { connectDB } from '../db';
import { env } from '../env';
import { HttpError } from '../errors';
import { Admin } from '../models/Admin';
import { Session, type SessionFields } from '../models/Session';
import {
    accessTokenTtlMs,
    generateDeviceId,
    generateRefreshToken,
    hashToken,
    sessionTtlMs,
    signAccessToken,
    verifyAccessToken,
} from './token';

// A login is a Session document (one per device) plus two httpOnly cookies:
// - an access token (short-lived JWT), checked on every admin request;
// - a refresh token (lasts the whole session), used only by refreshSession()
//   to get a new access token. It is replaced every time it is used.
// A token is only accepted while its session exists, so logging out revokes
// both straight away.

const ACCESS_COOKIE = 'sv_access';
const REFRESH_COOKIE = 'sv_refresh';
const LAST_SEEN_UPDATE_INTERVAL_MS = 5 * 60 * 1000;

// Two tabs (or two requests) can refresh with the same token at once. The
// slower one is still accepted for a short time instead of being treated as
// a stolen token.
const REFRESH_REUSE_GRACE_MS = 30 * 1000;

type AdminAccount = { _id: Types.ObjectId; email: string; name?: string | null };
type SessionRecord = SessionFields & { _id: Types.ObjectId };

const sessionExpired = () => new HttpError(401, 'Session expired. Please log in again.');

function toSessionInfo(admin: AdminAccount, session: { deviceId: string; expiresAt: Date }): AdminSessionInfo {
    return {
        admin: { id: String(admin._id), email: admin.email, name: admin.name ?? '' },
        deviceId: session.deviceId,
        expiresAt: session.expiresAt.toISOString(),
    };
}

const readCookie = (name: string) => cookies().get(name)?.value ?? null;

const clientIp = () => headers().get('x-forwarded-for')?.split(',')[0].trim() ?? '';

function setTokenCookie(name: string, value: string, maxAgeMs: number) {
    cookies().set(name, value, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: Math.floor(maxAgeMs / 1000),
    });
}

function clearTokenCookies() {
    cookies().delete(ACCESS_COOKIE);
    cookies().delete(REFRESH_COOKIE);
}

function setAccessCookie(admin: AdminAccount, session: { deviceId: string }) {
    const accessToken = signAccessToken({ adminId: String(admin._id), deviceId: session.deviceId });
    setTokenCookie(ACCESS_COOKIE, accessToken, accessTokenTtlMs());
}

function setRefreshCookie(refreshToken: string, expiresAt: Date) {
    setTokenCookie(REFRESH_COOKIE, refreshToken, expiresAt.getTime() - Date.now());
}

// The functions below that set cookies may only be called from a server
// action or route handler.

// Records a new login for `admin` and sets both token cookies.
export async function startSession(admin: AdminAccount): Promise<AdminSessionInfo> {
    const refreshToken = generateRefreshToken();
    const session = await Session.create({
        deviceId: generateDeviceId(),
        admin: admin._id,
        refreshTokenHash: hashToken(refreshToken),
        userAgent: headers().get('user-agent') ?? '',
        ip: clientIp(),
        expiresAt: new Date(Date.now() + sessionTtlMs()),
    });

    setAccessCookie(admin, session);
    setRefreshCookie(refreshToken, session.expiresAt);
    return toSessionInfo(admin, session);
}

// Swaps the refresh token for a new one and issues a new access token.
// Throws a 401 if the refresh token is missing, expired or revoked.
export async function refreshSession(): Promise<AdminSessionInfo> {
    const refreshToken = readCookie(REFRESH_COOKIE);
    if (!refreshToken) {
        throw sessionExpired();
    }

    await connectDB();
    const presentedHash = hashToken(refreshToken);
    const newRefreshToken = generateRefreshToken();
    const now = new Date();

    // One atomic update, so a refresh token can be exchanged only once.
    const rotated = await Session.findOneAndUpdate(
        { refreshTokenHash: presentedHash, expiresAt: { $gt: now } },
        { refreshTokenHash: hashToken(newRefreshToken), previousRefreshTokenHash: presentedHash, refreshedAt: now },
        { new: true }
    ).lean<SessionRecord>();

    if (rotated) {
        const admin = await findAdmin(rotated);
        setAccessCookie(admin, rotated);
        setRefreshCookie(newRefreshToken, rotated.expiresAt);
        return toSessionInfo(admin, rotated);
    }

    const replaced = await Session.findOne({ previousRefreshTokenHash: presentedHash, expiresAt: { $gt: now } }).lean<SessionRecord>();
    if (!replaced) {
        clearTokenCookies();
        throw sessionExpired();
    }

    // Another request just refreshed with this same token, and the browser
    // already has the new refresh cookie from it. Only a new access token is needed.
    const refreshedJustNow = replaced.refreshedAt && now.getTime() - replaced.refreshedAt.getTime() < REFRESH_REUSE_GRACE_MS;
    if (refreshedJustNow) {
        const admin = await findAdmin(replaced);
        setAccessCookie(admin, replaced);
        return toSessionInfo(admin, replaced);
    }

    // An old refresh token came back long after it was replaced: someone has
    // a copy of it. End the session so neither copy works any more.
    await Session.deleteOne({ _id: replaced._id });
    clearTokenCookies();
    throw sessionExpired();
}

async function findAdmin(session: SessionRecord): Promise<AdminAccount> {
    const admin = await Admin.findById(session.admin, 'email name').lean();
    if (!admin) {
        await Session.deleteOne({ _id: session._id });
        clearTokenCookies();
        throw sessionExpired();
    }
    return admin;
}

// Revokes this device's session and removes both cookies. Works even after
// the access token has expired.
export async function endSession() {
    const refreshToken = readCookie(REFRESH_COOKIE);
    if (refreshToken) {
        await connectDB();
        await Session.deleteOne({ refreshTokenHash: hashToken(refreshToken) });
    }
    clearTokenCookies();
}

// Verifies the access token (signature and expiry), then checks that its
// device id and admin still match an active session. Returns the logged-in
// admin, or null.
async function getAccessSession(): Promise<AdminSessionInfo | null> {
    const payload = verifyAccessToken(readCookie(ACCESS_COOKIE));
    if (!payload) return null;

    await connectDB();
    const session = await Session.findOne({
        deviceId: payload.did,
        admin: payload.sub,
        expiresAt: { $gt: new Date() },
    });
    if (!session) return null;

    const admin = await Admin.findById(session.admin, 'email name').lean();
    if (!admin) return null;

    // Only touch the database every few minutes, not on every request.
    if (Date.now() - session.lastSeenAt.getTime() > LAST_SEEN_UPDATE_INTERVAL_MS) {
        await Session.updateOne({ _id: session._id }, { lastSeenAt: new Date() });
    }

    return toSessionInfo(admin, session);
}

// For rendering pages: the logged-in admin, or null. If only the refresh
// token is still valid the admin counts as logged in; their first API call
// gets a 401 and the admin panel refreshes the tokens then. (Pages cannot
// set cookies, so the refresh cannot happen here.)
export async function getAdminSession(): Promise<AdminSessionInfo | null> {
    const accessSession = await getAccessSession();
    if (accessSession) return accessSession;

    const refreshToken = readCookie(REFRESH_COOKIE);
    if (!refreshToken) return null;

    await connectDB();
    const session = await Session.findOne({
        refreshTokenHash: hashToken(refreshToken),
        expiresAt: { $gt: new Date() },
    }).lean<SessionRecord>();
    if (!session) return null;

    const admin = await Admin.findById(session.admin, 'email name').lean();
    return admin ? toSessionInfo(admin, session) : null;
}

// Protects admin-only route handlers and server actions. Only a valid
// access token is accepted here, never the refresh token.
export async function requireAdmin(): Promise<AdminSessionInfo> {
    const session = await getAccessSession();
    if (!session) {
        throw sessionExpired();
    }
    return session;
}
