// One-time job: converts product images already in uploads/products to WebP.
// Each original is replaced (not copied), and the product is updated to point
// at the new file. Safe to run again: WebP images are skipped.
//
// Run from frontend/: npm run convert-images

import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import sharp from 'sharp';

const PRODUCT_IMAGES_DIR = path.join(path.resolve(process.env.UPLOADS_DIR || 'uploads'), 'products');

// sharp's cache keeps source files open, which stops them being deleted on Windows.
sharp.cache(false);

async function convertProductImage(products, product) {
    const oldName = product.image.filename;
    const oldPath = path.join(PRODUCT_IMAGES_DIR, oldName);
    const newName = `${path.parse(oldName).name}.webp`;

    if (!fs.existsSync(oldPath)) {
        console.warn(`Skipped "${product.name}": ${oldName} is missing`);
        return false;
    }

    await sharp(oldPath, { animated: true }).rotate().webp({ quality: 80 }).toFile(path.join(PRODUCT_IMAGES_DIR, newName));
    await products.updateOne(
        { _id: product._id },
        { $set: { image: { filename: newName, url: `/uploads/products/${newName}` } } }
    );

    // Only remove the original once the product points at the WebP copy.
    await fs.promises.unlink(oldPath);
    console.log(`Converted ${oldName} -> ${newName}`);
    return true;
}

async function main() {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set (see .env.local.example)');
    await mongoose.connect(process.env.MONGODB_URI);

    const products = mongoose.connection.collection('products');
    const pending = await products.find({ 'image.filename': { $exists: true, $not: /\.webp$/i } }).toArray();

    let converted = 0;
    for (const product of pending) {
        try {
            if (await convertProductImage(products, product)) converted += 1;
        } catch (err) {
            console.error(`Failed "${product.name}" (${product.image.filename}):`, err.message);
        }
    }

    console.log(`Done. ${converted} of ${pending.length} image(s) converted.`);
}

try {
    await main();
} finally {
    await mongoose.disconnect();
}
