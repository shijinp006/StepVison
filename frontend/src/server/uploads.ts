import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { env } from './env';
import { HttpError } from './errors';

// Product images are stored as WebP files in <uploadsDir>/products and served
// by app/uploads/products/[filename]/route.ts at /uploads/products/<file>.

const PRODUCT_IMAGES_DIR = path.join(env.uploadsDir, 'products');
const WEBP_QUALITY = 80;
const SAFE_FILENAME = /^[\w.-]+$/;

const CONTENT_TYPES: Record<string, string> = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
};

// sharp's cache keeps source files open, which stops them being deleted on
// Windows. Each image is only processed once anyway.
sharp.cache(false);

export interface StoredImage {
    filename: string;
    url: string;
}

// Converts the upload to WebP and saves it under a random name (never the
// client-supplied one). Animated GIFs stay animated; photos are turned
// upright using their EXIF data.
export async function saveProductImage(file: File): Promise<StoredImage> {
    const input = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;

    // Created on first upload rather than at startup: on a read-only
    // filesystem (Vercel) only uploads should fail, not the whole site.
    await fs.mkdir(PRODUCT_IMAGES_DIR, { recursive: true });

    try {
        await sharp(input, { animated: true })
            .rotate()
            .webp({ quality: WEBP_QUALITY })
            .toFile(path.join(PRODUCT_IMAGES_DIR, filename));
    } catch {
        throw new HttpError(400, 'The image could not be read. Try a different file', {
            image: 'The image could not be read',
        });
    }

    return { filename, url: `/uploads/products/${filename}` };
}

// Removes an uploaded image in the background. A missing file is fine.
export function deleteProductImage(filename?: string | null) {
    if (!filename) return;

    const filePath = path.join(PRODUCT_IMAGES_DIR, path.basename(filename));
    fs.unlink(filePath).catch((err: NodeJS.ErrnoException) => {
        if (err.code !== 'ENOENT') console.error(`Could not delete image ${filePath}:`, err.message);
    });
}

// The stored image and its content type, or null if there is no such file.
export async function readProductImage(filename: string) {
    const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()];
    if (!SAFE_FILENAME.test(filename) || !contentType) return null;

    try {
        const data = await fs.readFile(path.join(PRODUCT_IMAGES_DIR, filename));
        return { data, contentType };
    } catch {
        return null;
    }
}
