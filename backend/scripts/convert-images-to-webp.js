// One-time job: converts product images already in uploads/products to WebP.
// Each original is replaced (not copied), and the product is updated to point
// at the new file. Safe to run again: WebP images are skipped.
//
// Run from backend/: npm run convert-images

import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { PRODUCT_UPLOADS_DIR } from '../src/config/paths.js';
import { Product } from '../src/models/Product.js';
import { convertToWebp } from '../src/utils/webp.js';

async function convertProductImage(product) {
    const oldName = product.image.filename;
    const oldPath = path.join(PRODUCT_UPLOADS_DIR, oldName);
    const newName = `${path.parse(oldName).name}.webp`;
    const newPath = path.join(PRODUCT_UPLOADS_DIR, newName);

    if (!fs.existsSync(oldPath)) {
        console.warn(`Skipped "${product.name}": ${oldName} is missing`);
        return false;
    }

    await convertToWebp(oldPath, newPath);

    product.image = { filename: newName, url: `/uploads/products/${newName}` };
    await product.save();

    // Only remove the original once the product points at the WebP copy.
    await fs.promises.unlink(oldPath);
    console.log(`Converted ${oldName} -> ${newName}`);
    return true;
}

async function main() {
    await connectDB();

    const products = await Product.find({
        'image.filename': { $exists: true, $not: /\.webp$/i },
    });

    let converted = 0;
    for (const product of products) {
        try {
            if (await convertProductImage(product)) converted += 1;
        } catch (err) {
            console.error(`Failed "${product.name}" (${product.image.filename}):`, err.message);
        }
    }

    console.log(`Done. ${converted} of ${products.length} image(s) converted.`);
}

try {
    await main();
} finally {
    await mongoose.disconnect();
}
