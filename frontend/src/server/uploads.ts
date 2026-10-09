import 'server-only';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { CLOUDINARY_FOLDERS } from '@/lib/cloudinary';
import { env } from './env';
import { HttpError } from './errors';

// Product images are stored in Cloudinary under stepvision/hotel/products.
// The product keeps the Cloudinary public id as `filename` (used to delete
// it later) and a delivery URL as `url`.

cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
});

export interface StoredImage {
    filename: string;
    url: string;
}

// f_auto/q_auto serve WebP/AVIF at a sensible quality to browsers that
// support it, so the original is uploaded as-is.
function deliveryUrl({ public_id, version }: Pick<UploadApiResponse, 'public_id' | 'version'>) {
    return cloudinary.url(public_id, { version, fetch_format: 'auto', quality: 'auto' });
}

// Uploads under a random name chosen by Cloudinary (never the client-supplied
// one). Photos are turned upright using their EXIF data.
export async function saveProductImage(file: File): Promise<StoredImage> {
    const input = Buffer.from(await file.arrayBuffer());

    let result: UploadApiResponse;
    try {
        result = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream({ folder: CLOUDINARY_FOLDERS.products, resource_type: 'image' }, (err, res) =>
                    err || !res ? reject(err ?? new Error('Empty Cloudinary response')) : resolve(res)
                )
                .end(input);
        });
    } catch (err) {
        const { http_code, message } = (err ?? {}) as { http_code?: number; message?: string };
        if (http_code === 400) {
            throw new HttpError(400, 'The image could not be read. Try a different file', {
                image: 'The image could not be read',
            });
        }
        console.error('Cloudinary upload failed:', message);
        throw new HttpError(502, 'The image could not be uploaded. Please try again');
    }

    return { filename: result.public_id, url: deliveryUrl(result) };
}

// Removes an uploaded image in the background. A missing file is fine.
export function deleteProductImage(publicId?: string | null) {
    if (!publicId) return;

    cloudinary.uploader
        .destroy(publicId, { invalidate: true })
        .catch((err: { message?: string }) => console.error(`Could not delete image ${publicId}:`, err.message));
}
