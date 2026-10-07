import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { PRODUCT_UPLOADS_DIR } from '../config/paths.js';
import { HttpError } from '../utils/HttpError.js';
import { convertToWebp } from '../utils/webp.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Kept in memory so it can be converted to WebP before anything is written.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
        cb(new HttpError(400, 'Only JPG, PNG, WEBP or GIF images are allowed'));
    },
});

const errorMessages = {
    LIMIT_FILE_SIZE: 'Image must be 5 MB or smaller',
    LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Upload the image as "image"',
    LIMIT_FILE_COUNT: 'Only one image can be uploaded',
};

// Saves the uploaded image as WebP under a random name (never the
// client-supplied one) and sets req.file.filename for the controller.
async function saveAsWebp(file) {
    // Created on first upload rather than at startup: on a read-only
    // filesystem (Vercel) only uploads should fail, not the whole server.
    await fs.promises.mkdir(PRODUCT_UPLOADS_DIR, { recursive: true });

    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;
    try {
        await convertToWebp(file.buffer, path.join(PRODUCT_UPLOADS_DIR, filename));
    } catch {
        throw new HttpError(400, 'The image could not be read. Try a different file');
    }

    file.filename = filename;
    file.buffer = undefined;
}

// Wraps multer so upload problems come back as a 400 JSON response
// instead of falling through to the generic error handler.
export function uploadProductImage(req, res, next) {
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: errorMessages[err.code] || err.message });
        }
        if (err) return next(err);
        if (!req.file) return next();

        saveAsWebp(req.file).then(() => next(), next);
    });
}

export function deleteProductImage(filename) {
    if (!filename) return;
    const filePath = path.join(PRODUCT_UPLOADS_DIR, path.basename(filename));
    fs.promises.unlink(filePath).catch((err) => {
        if (err.code !== 'ENOENT') console.error(`Could not delete image ${filePath}:`, err.message);
    });
}
