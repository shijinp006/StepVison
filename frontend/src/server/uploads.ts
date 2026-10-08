import 'server-only';
import crypto from 'node:crypto';
import path from 'node:path';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { connectDB } from './db';
import { HttpError } from './errors';

// Product images are stored as WebP files in MongoDB (GridFS), not on disk:
// Vercel's filesystem is read-only. They are served by
// app/uploads/products/[filename]/route.ts at /uploads/products/<file>.

const BUCKET_NAME = 'productImages';
const WEBP_QUALITY = 80;
const SAFE_FILENAME = /^[\w.-]+$/;

const CONTENT_TYPES: Record<string, string> = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
};

export interface StoredImage {
    filename: string;
    url: string;
}

// Only valid after connectDB() has resolved.
function imageBucket() {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Not connected to MongoDB');
    return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
}

// Converts the upload to WebP and saves it under a random name (never the
// client-supplied one). Animated GIFs stay animated; photos are turned
// upright using their EXIF data.
export async function saveProductImage(file: File): Promise<StoredImage> {
    const input = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;

    let webp: Buffer;
    try {
        webp = await sharp(input, { animated: true }).rotate().webp({ quality: WEBP_QUALITY }).toBuffer();
    } catch {
        throw new HttpError(400, 'The image could not be read. Try a different file', {
            image: 'The image could not be read',
        });
    }

    await connectDB();
    await new Promise<void>((resolve, reject) => {
        imageBucket().openUploadStream(filename).on('finish', resolve).on('error', reject).end(webp);
    });

    return { filename, url: `/uploads/products/${filename}` };
}

// Removes an uploaded image in the background. A missing file is fine.
export function deleteProductImage(filename?: string | null) {
    if (!filename) return;

    const remove = async () => {
        await connectDB();
        const bucket = imageBucket();
        const files = await bucket.find({ filename: path.basename(filename) }, { projection: { _id: 1 } }).toArray();
        await Promise.all(files.map((file) => bucket.delete(file._id)));
    };
    remove().catch((err: Error) => console.error(`Could not delete image ${filename}:`, err.message));
}

// The stored image and its content type, or null if there is no such file.
export async function readProductImage(filename: string) {
    const contentType = CONTENT_TYPES[path.extname(filename).toLowerCase()];
    if (!SAFE_FILENAME.test(filename) || !contentType) return null;

    await connectDB();
    const bucket = imageBucket();
    const [file] = await bucket.find({ filename }).limit(1).toArray();
    if (!file) return null;

    const chunks: Buffer[] = [];
    for await (const chunk of bucket.openDownloadStream(file._id)) chunks.push(chunk as Buffer);
    return { data: Buffer.concat(chunks), contentType };
}
