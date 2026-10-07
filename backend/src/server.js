import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env, configErrors } from './config/env.js';
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

// Reports setup problems (names only, never values) so a broken deployment
// can be diagnosed from the browser.
app.get('/api/health', async (req, res) => {
    if (configErrors.length > 0) {
        return res.status(500).json({ status: 'error', problems: configErrors });
    }
    try {
        await whenReady();
        res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
        res.status(500).json({ status: 'error', problems: [`Database: ${err.message}`] });
    }
});

// Connect to MongoDB and seed once, on the first request that needs it. On
// Vercel each cold start runs this again; a failure is retried next request.
let ready;
function whenReady() {
    if (configErrors.length > 0) {
        return Promise.reject(new Error(configErrors.join(' ')));
    }
    ready ??= (async () => {
        await connectDB();
        await ensureAdmin();
        await refreshCategoryCache();
    })().catch((err) => {
        ready = undefined;
        throw err;
    });
    return ready;
}

app.use('/api', (req, res, next) => {
    whenReady().then(() => next(), next);
});

app.use('/api/catalog', catalogRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/categories', categoryRoutes);

app.use(notFound);
app.use(errorHandler);

// Vercel runs the exported app itself; locally we start a server and fail
// fast if MongoDB is unreachable.
if (!process.env.VERCEL) {
    try {
        await whenReady();
        app.listen(env.port, () => console.log(`Admin API running on http://localhost:${env.port}`));
    } catch (err) {
        console.error('Failed to start server:', err.message);
        process.exit(1);
    }
}

export default app;
