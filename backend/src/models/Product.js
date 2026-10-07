import mongoose from 'mongoose';

export const PRODUCT_LIMITS = {
    nameLength: 200,
    maxPrice: 10_000_000,
    maxQuantity: 1_000_000,
    searchLength: 100,
    maxPageSize: 100,
};

export const PRODUCT_STATUSES = ['active', 'archived'];

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [PRODUCT_LIMITS.nameLength, `Product name must be ${PRODUCT_LIMITS.nameLength} characters or fewer`],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
            max: [PRODUCT_LIMITS.maxPrice, `Price cannot exceed ${PRODUCT_LIMITS.maxPrice}`],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
            max: [PRODUCT_LIMITS.maxQuantity, `Quantity cannot exceed ${PRODUCT_LIMITS.maxQuantity}`],
            validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' },
        },
        // filename is only set for images uploaded to this server; imported
        // catalog products point at a public or external URL instead.
        image: {
            filename: { type: String },
            url: { type: String, required: true },
        },
        // Ids of a Category and one of its subcategories (e.g. "cat-1" /
        // "sub-1-1"); the validators check they exist.
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

export const Product = mongoose.model('Product', productSchema);
