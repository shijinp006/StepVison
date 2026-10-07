const required = ['MONGODB_URI', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Copy backend/.env.example to backend/.env and fill in the values.');
    process.exit(1);
}

if (process.env.MONGODB_URI.includes('<db_password>')) {
    console.error('MONGODB_URI still contains <db_password>. Replace it with your MongoDB Atlas user password in backend/.env.');
    process.exit(1);
}

export const env = {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI,
    isProduction: process.env.NODE_ENV === 'production',
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    adminEmail: process.env.ADMIN_EMAIL.toLowerCase().trim(),
    adminPassword: process.env.ADMIN_PASSWORD,
    sessionTtlHours: Number(process.env.SESSION_TTL_HOURS) || 24,
    jwtSecret: process.env.JWT_SECRET,
};
