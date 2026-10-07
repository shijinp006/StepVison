import mongoose from 'mongoose';

// One document per logged-in device. Created on login, deleted on logout.
// Only a SHA-256 hash of the session id is stored, so a database leak
// does not expose usable session cookies.
const sessionSchema = new mongoose.Schema(
    {
        sessionHash: { type: String, required: true, unique: true },
        deviceId: { type: String, required: true, unique: true },
        admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
        userAgent: { type: String, default: '' },
        ip: { type: String, default: '' },
        lastSeenAt: { type: Date, default: Date.now },
        // MongoDB removes the document automatically once this date passes.
        expiresAt: { type: Date, required: true, index: { expires: 0 } },
    },
    { timestamps: true }
);

export const Session = mongoose.model('Session', sessionSchema);
