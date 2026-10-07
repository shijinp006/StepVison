import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { UPLOADS_DIR } from './config/paths.js';
import { ensureAdmin } from './utils/ensureAdmin.js';
import { refreshCategoryCache } from './utils/categories.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Requests arrive through the Next.js proxy, so trust it for req.ip.
app.set('trust proxy', 1);

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', index: false }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/catalog', catalogRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/categories', categoryRoutes);

app.use(notFound);
app.use(errorHandler);

try {
    await connectDB();
    await ensureAdmin();
    await refreshCategoryCache();
    app.listen(env.port, () => console.log(`Admin API running on http://localhost:${env.port}`));
} catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
}
