// One-off move of this site's images to Cloudinary (stepvision/hotel/...).
//
//   node --env-file=.env.local scripts/migrate-images-to-cloudinary.mjs           # dry run: shows what would happen
//   node --env-file=.env.local scripts/migrate-images-to-cloudinary.mjs --apply   # uploads and updates the database
//
// 1. Site images in public/images (hero, banners, category cards) go to
//    stepvision/hotel/site under fixed names, read by siteImage() in
//    src/lib/cloudinary.ts. Re-running overwrites them.
// 2. Products whose image is still local (/images/products/... from the
//    catalog import, or /uploads/products/... stored in MongoDB GridFS) are
//    uploaded to stepvision/hotel/products and repointed at Cloudinary.
//    GridFS files are left in place; delete the productImages.* collections
//    once everything looks right.
// Safe to re-run: products already on Cloudinary are skipped.

import fs from 'node:fs/promises';
import path from 'node:path';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

const ROOT = 'stepvision/hotel';
const PUBLIC_DIR = path.resolve('public');
const APPLY = process.argv.includes('--apply');

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const slug = (name) =>
    path
        .parse(name)
        .name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

const deliveryUrl = ({ public_id, version }) =>
    cloudinary.url(public_id, { version, fetch_format: 'auto', quality: 'auto' });

function upload(source, publicId) {
    const options = { public_id: publicId, overwrite: true, resource_type: 'image' };
    if (typeof source === 'string') return cloudinary.uploader.upload(source, options);
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(options, (err, res) => (err ? reject(err) : resolve(res)))
            .end(source);
    });
}

async function migrateSiteImages() {
    const sources = [
        { dir: 'images', folder: `${ROOT}/site` },
        { dir: 'images/categories', folder: `${ROOT}/site/categories` },
    ];

    for (const { dir, folder } of sources) {
        const entries = await fs.readdir(path.join(PUBLIC_DIR, dir), { withFileTypes: true });
        for (const entry of entries.filter((e) => e.isFile())) {
            const publicId = `${folder}/${slug(entry.name)}`;
            console.log(`site     ${dir}/${entry.name} -> ${publicId}`);
            if (APPLY) await upload(path.join(PUBLIC_DIR, dir, entry.name), publicId);
        }
    }
}

async function migrateProductImages() {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    const db = mongoose.connection.db;
    const products = db.collection('products');
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'productImages' });

    const local = await products
        .find({ 'image.url': { $regex: '^/(images|uploads)/products/' } }, { projection: { name: 1, image: 1 } })
        .toArray();
    console.log(`\n${local.length} product(s) with a local image`);

    let moved = 0;
    for (const product of local) {
        const url = product.image.url;
        const file = decodeURIComponent(path.basename(url));
        const publicId = `${ROOT}/products/${slug(file)}`;
        console.log(`product  ${product.name}: ${url} -> ${publicId}`);
        if (!APPLY) continue;

        try {
            let source;
            if (url.startsWith('/uploads/')) {
                const [stored] = await bucket.find({ filename: file }).limit(1).toArray();
                if (!stored) throw new Error('not found in GridFS');
                const chunks = [];
                for await (const chunk of bucket.openDownloadStream(stored._id)) chunks.push(chunk);
                source = Buffer.concat(chunks);
            } else {
                source = path.join(PUBLIC_DIR, 'images', 'products', file);
                await fs.access(source);
            }

            const result = await upload(source, publicId);
            await products.updateOne(
                { _id: product._id },
                { $set: { image: { filename: result.public_id, url: deliveryUrl(result) } } }
            );
            moved++;
        } catch (err) {
            console.error(`  FAILED: ${err.message}`);
        }
    }
    if (APPLY) console.log(`${moved}/${local.length} product image(s) moved`);
}

try {
    console.log(APPLY ? 'Applying changes\n' : 'Dry run (pass --apply to upload)\n');
    await migrateSiteImages();
    await migrateProductImages();
} finally {
    await mongoose.disconnect();
}
