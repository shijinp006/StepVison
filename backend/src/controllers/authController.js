import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { Session } from '../models/Session.js';
import { HttpError } from '../utils/HttpError.js';
import {
    generateTokenId,
    generateDeviceId,
    hashTokenId,
    sessionTtlMs,
    signAccessToken,
    verifyAccessToken,
    readAccessToken,
    setTokenCookie,
    clearTokenCookie,
} from '../utils/session.js';

const toAdminResponse = (admin, session) => ({
    admin: { id: admin._id, email: admin.email, name: admin.name },
    deviceId: session.deviceId,
    expiresAt: session.expiresAt,
});

export async function login(req, res) {
    const { email, password } = req.validated.body;

    const admin = await Admin.findOne({ email });
    const passwordOk = admin && (await bcrypt.compare(password, admin.passwordHash));
    if (!passwordOk) throw new HttpError(401, 'Invalid email or password');

    // Record this login (token id + device id) so the JWT can be revoked on logout.
    const tokenId = generateTokenId();
    const session = await Session.create({
        sessionHash: hashTokenId(tokenId),
        deviceId: generateDeviceId(),
        admin: admin._id,
        userAgent: req.get('user-agent') || '',
        ip: req.ip,
        expiresAt: new Date(Date.now() + sessionTtlMs()),
    });

    const token = signAccessToken({ adminId: admin._id, deviceId: session.deviceId, tokenId });
    setTokenCookie(res, token);
    res.status(200).json({ ...toAdminResponse(admin, session), token });
}

export async function logout(req, res) {
    // Revoke this device's token by removing its session from the database.
    const payload = verifyAccessToken(readAccessToken(req) || '');
    if (payload?.jti) await Session.deleteOne({ sessionHash: hashTokenId(payload.jti) });

    clearTokenCookie(res);
    res.status(200).json({ message: 'Logged out' });
}

export async function me(req, res) {
    res.status(200).json(toAdminResponse(req.admin, req.adminSession));
}
