import 'server-only';

const REQUIRED = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];

// Problems with the environment. They are reported by /api/health and
// thrown on the first database call, instead of crashing the whole site.
export const configErrors: string[] = [];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
    configErrors.push(`Missing required environment variables: ${missing.join(', ')}`);
}

if (process.env.MONGODB_URI?.includes('<db_password>')) {
    configErrors.push('MONGODB_URI still contains <db_password>. Replace it with your MongoDB Atlas user password.');
}

export const env = {
    mongoUri: process.env.MONGODB_URI ?? '',
    isProduction: process.env.NODE_ENV === 'production',
    adminEmail: (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim(),
    adminPassword: process.env.ADMIN_PASSWORD ?? '',
    jwtSecret: process.env.JWT_SECRET ?? '',
    // How long an access token lasts before the browser must refresh it.
    accessTokenTtlMinutes: Number(process.env.ACCESS_TOKEN_TTL_MINUTES) || 15,
    // How long a login (refresh token) lasts before the admin must sign in again.
    sessionTtlHours: Number(process.env.SESSION_TTL_HOURS) || 24,
};
