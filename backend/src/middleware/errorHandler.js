import mongoose from 'mongoose';
import { deleteProductImage } from './uploadImage.js';

export function notFound(req, res) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
    // A request that failed after multer saved a file should not leave it behind.
    if (req.file) deleteProductImage(req.file.filename);

    if (res.headersSent) return next(err);

    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
        return res.status(400).json({ message: Object.values(errors).join(', '), errors });
    }
    if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: `Invalid ${err.path}` });
    }
    // Unique index violation, e.g. two requests adding the same category at once.
    if (err.code === 11000) {
        return res.status(409).json({ message: 'That already exists' });
    }
    // Thrown by express.json() for a malformed or oversized body.
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Request body must be valid JSON' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Request body is too large' });
    }

    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
        message: status >= 500 ? 'Internal server error' : err.message,
        ...(status < 500 && err.errors && { errors: err.errors }),
    });
}
