import mongoose, { InferSchemaType } from 'mongoose';
import { compileModel } from './compileModel';

export const PRODUCT_LIMITS = {
    nameLength: 200,
    searchLength: 100,
    maxPageSize: 100,
    imageMaxBytes: 4 * 1024 * 1024, // Vercel rejects request bodies over 4.5 MB
    imageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
};

export const PRODUCT_STATUSES = ['active', 'archived'] as const;

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [PRODUCT_LIMITS.nameLength, `Product name must be ${PRODUCT_LIMITS.nameLength} characters or fewer`],
        },
        // filename is the Cloudinary public id (stepvision/hotel/products/...)
        // and url its delivery URL. Without a filename, url is external.
        image: {
            filename: { type: String },
            url: { type: String, required: true },
        },
        // Ids of a Category and one of its subcategories (e.g. "cat-1" /
        // "sub-1-1"); the product service checks they exist.
        category: { type: String, required: [true, 'Category is required'], trim: true },
        subcategory: { type: String, trim: true },
        // Catalog fields shown on the storefront.
        code: { type: String, trim: true, unique: true, sparse: true },
        brand: { type: String, trim: true },
        shortDescription: { type: String, trim: true },
        isFeatured: { type: Boolean, default: false },
        status: { type: String, enum: PRODUCT_STATUSES, default: 'active' },
    },
    { timestamps: true }
);

export type ProductFields = InferSchemaType<typeof productSchema>;

export const Product = compileModel<ProductFields>('Product', productSchema);
