import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { PRODUCT_UPLOADS_DIR } from '../config/paths.js';
import { HttpError } from '../utils/HttpError.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

const storage = multer.diskStorage({
    // Created on first upload rather than at startup: on a read-only
    // filesystem (Vercel) only uploads should fail, not the whole server.
    destination: (req, file, cb) => {
        fs.promises.mkdir(PRODUCT_UPLOADS_DIR, { recursive: true }).then(() => cb(null, PRODUCT_UPLOADS_DIR), cb);
    },
    // Random name with an extension derived from the mime type, never from the
    // client-supplied filename.
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ALLOWED_TYPES[file.mimetype]}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
        cb(new HttpError(400, 'Only JPG, PNG, WEBP or GIF images are allowed'));
    },
});

const errorMessages = {
    LIMIT_FILE_SIZE: 'Image must be 5 MB or smaller',
    LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Upload the image as "image"',
    LIMIT_FILE_COUNT: 'Only one image can be uploaded',
};

// Wraps multer so upload problems come back as a 400 JSON response
// instead of falling through to the generic error handler.
export function uploadProductImage(req, res, next) {
    upload.single('image')(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: errorMessages[err.code] || err.message });
        }
        next(err);
    });
}

export function deleteProductImage(filename) {
    if (!filename) return;
    const filePath = path.join(PRODUCT_UPLOADS_DIR, path.basename(filename));
    fs.promises.unlink(filePath).catch((err) => {
        if (err.code !== 'ENOENT') console.error(`Could not delete image ${filePath}:`, err.message);
    });
}
