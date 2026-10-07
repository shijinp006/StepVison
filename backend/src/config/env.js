const required = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];

// Problems with the environment. Locally we stop right away; on Vercel and
// Render the server keeps running so /api/health can report them (see server.js).
export const configErrors = [];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
    configErrors.push(`Missing required environment variables: ${missing.join(', ')}`);
}

if (process.env.MONGODB_URI?.includes('<db_password>')) {
    configErrors.push('MONGODB_URI still contains <db_password>. Replace it with your MongoDB Atlas user password.');
}

// CORS compares origins exactly, so turn "my-site.vercel.app" or
// "https://my-site.vercel.app/" into "https://my-site.vercel.app".
function toOrigin(value) {
    const raw = value.trim();
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
        return new URL(withProtocol).origin;
    } catch {
        configErrors.push(`CLIENT_ORIGIN is not a valid URL: "${raw}"`);
        return raw;
    }
}

export const env = {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI,
    isProduction: process.env.NODE_ENV === 'production',
    clientOrigin: toOrigin(process.env.CLIENT_ORIGIN || 'http://localhost:3000'),
    adminEmail: process.env.ADMIN_EMAIL?.toLowerCase().trim(),
    adminPassword: process.env.ADMIN_PASSWORD,
    sessionTtlHours: Number(process.env.SESSION_TTL_HOURS) || 24,
    jwtSecret: process.env.JWT_SECRET,
};

for (const message of configErrors) console.error(message);
if (configErrors.length > 0 && !process.env.VERCEL && !process.env.RENDER) {
    console.error('Copy backend/.env.example to backend/.env and fill in the values.');
    process.exit(1);
}
