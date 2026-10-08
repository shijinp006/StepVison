import mongoose, { InferSchemaType } from 'mongoose';
import { compileModel } from './compileModel';

export const CATEGORY_LIMITS = { nameLength: 100, descriptionLength: 500, maxPageSize: 100 };

const { nameLength, descriptionLength } = CATEGORY_LIMITS;

// Subcategories live inside their category.
const subcategorySchema = new mongoose.Schema(
    {
        // Stable id stored on products (e.g. "sub-1-1"); new ones get
        // "sub-<category slug>-<slug>".
        id: { type: String, required: true, trim: true },
        name: {
            type: String,
            required: [true, 'Subcategory name is required'],
            trim: true,
            maxlength: [nameLength, `Subcategory name must be ${nameLength} characters or fewer`],
        },
        slug: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const categorySchema = new mongoose.Schema(
    {
        // Stable id stored on products (e.g. "cat-1"); new ones get "cat-<slug>".
        id: { type: String, required: true, unique: true, trim: true },
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [nameLength, `Category name must be ${nameLength} characters or fewer`],
        },
        slug: { type: String, required: true, unique: true, trim: true },
        description: {
            type: String,
            trim: true,
            maxlength: [descriptionLength, `Description must be ${descriptionLength} characters or fewer`],
        },
        subcategories: { type: [subcategorySchema], default: [] },
    },
    { timestamps: true }
);

export type CategoryFields = InferSchemaType<typeof categorySchema>;

export const Category = compileModel<CategoryFields>('Category', categorySchema);
