import { z } from 'zod';
import { PRODUCT_LIMITS } from '../models/Product';
import { categoryFilterQuery, categoryId, paginationQuery, requiredText, searchQuery } from './common';

const { nameLength, imageMaxBytes, imageTypes, maxPageSize, searchLength } = PRODUCT_LIMITS;

// ---------- Field schemas ----------

// Checked by shape rather than `instanceof File`, which can fail when the
// upload was parsed by a different copy of the File class.
const isFile = (value: unknown): value is File =>
    typeof value === 'object' && value !== null && 'arrayBuffer' in value && 'size' in value && 'type' in value;

const image = z
    .custom<File>((value) => isFile(value) && value.size > 0, 'Product image is required')
    .refine((file) => imageTypes.includes(file.type), 'Only JPG, PNG, WEBP or GIF images are allowed')
    .refine((file) => file.size <= imageMaxBytes, 'Image must be 5 MB or smaller');

// An empty subcategory clears it. The service checks that both ids exist.
const productFields = z.object({
    name: requiredText('Product name', nameLength),
    category: z.string({ error: 'Category is required' }).trim().min(1, 'Category is required').pipe(categoryId()),
    subcategory: z
        .string()
        .trim()
        .optional()
        .transform((id) => id || undefined)
        .pipe(categoryId('subcategory').optional()),
});

// ---------- Input schemas ----------

export const createProductSchema = productFields.extend({ image });

// The form always sends every field; the image only when it is replaced.
export const updateProductSchema = productFields.extend({ image: image.optional() });

export const listProductsQuerySchema = paginationQuery({ defaultLimit: 20, maxPageSize })
    .extend({ search: searchQuery(searchLength) })
    .and(categoryFilterQuery);

export type CreateProductInput = z.output<typeof createProductSchema>;
export type UpdateProductInput = z.output<typeof updateProductSchema>;
export type ListProductsQuery = z.output<typeof listProductsQuerySchema>;
