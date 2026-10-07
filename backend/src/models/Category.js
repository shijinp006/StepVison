import mongoose from 'mongoose';

export const CATEGORY_LIMITS = { nameLength: 100, descriptionLength: 500, maxPageSize: 100 };

const nameField = (label) => ({
    type: String,
    required: [true, `${label} name is required`],
    trim: true,
    maxlength: [CATEGORY_LIMITS.nameLength, `${label} name must be ${CATEGORY_LIMITS.nameLength} characters or fewer`],
});

// Subcategories live inside their category.
const subcategorySchema = new mongoose.Schema(
    {
        // Stable id stored on products (e.g. "sub-1-1"); new ones get
        // "sub-<category slug>-<slug>".
        id: { type: String, required: true, trim: true },
        name: nameField('Subcategory'),
        slug: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const categorySchema = new mongoose.Schema(
    {
        // Stable id stored on products (e.g. "cat-1"); new ones get "cat-<slug>".
        id: { type: String, required: true, unique: true, trim: true },
        name: nameField('Category'),
        slug: { type: String, required: true, unique: true, trim: true },
        description: {
            type: String,
            trim: true,
            maxlength: [
                CATEGORY_LIMITS.descriptionLength,
                `Description must be ${CATEGORY_LIMITS.descriptionLength} characters or fewer`,
            ],
        },
        subcategories: { type: [subcategorySchema], default: [] },
    },
    { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
