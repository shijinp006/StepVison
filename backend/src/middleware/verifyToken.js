import { Session } from '../models/Session.js';
import { HttpError } from '../utils/HttpError.js';
import { readAccessToken, verifyAccessToken, hashTokenId, clearTokenCookie } from '../utils/session.js';

const LAST_SEEN_UPDATE_INTERVAL_MS = 5 * 60 * 1000;

function rejectExpired(res, next) {
    clearTokenCookie(res);
    next(new HttpError(401, 'Session expired. Please log in again.'));
}

// Protects admin-only routes. Verifies the JWT (signature + expiry), then
// checks that its token id, device id and admin still match an active
// session in the database, so tokens revoked by logout are rejected.
// On success the logged-in admin is available as req.admin.
export async function verifyToken(req, res, next) {
    const token = readAccessToken(req);
    if (!token) {
        return next(new HttpError(401, 'Not authenticated'));
    }

    const payload = verifyAccessToken(token);
    if (!payload?.jti || !payload.sub || !payload.did) {
        return rejectExpired(res, next);
    }

    const session = await Session.findOne({
        sessionHash: hashTokenId(payload.jti),
        deviceId: payload.did,
        admin: payload.sub,
        expiresAt: { $gt: new Date() },
    }).populate('admin', 'email name');

    if (!session?.admin) {
        return rejectExpired(res, next);
    }

    // Only touch the database every few minutes, not on every request.
    if (Date.now() - session.lastSeenAt.getTime() > LAST_SEEN_UPDATE_INTERVAL_MS) {
        session.lastSeenAt = new Date();
        await session.save();
    }

    req.admin = session.admin;
    req.adminSession = session;
    next();
}
