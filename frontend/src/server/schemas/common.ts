import { z } from 'zod';
import { HttpError, type FieldErrors } from '../errors';

// Every input (form fields, JSON arguments, query strings, route params) is
// checked with a zod schema from this folder before a service sees it.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
// Category and subcategory ids look like "cat-1" or "sub-1-1", not ObjectIds.
const CATEGORY_ID_PATTERN = /^[a-z0-9-]{1,150}$/;

// Returns the cleaned input, or throws a 400 whose `errors` map each field
// to its first problem.
export function parseInput<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
    const result = schema.safeParse(input);
    if (result.success) return result.data;

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
        const field = issue.path.join('.') || 'input';
        errors[field] ??= issue.message;
    }
    throw new HttpError(400, Object.values(errors).join(', '), errors);
}

// ---------- Field schemas ----------

export const requiredText = (label: string, maxLength: number) =>
    z
        .string({ error: `${label} is required` })
        .trim()
        .min(1, `${label} is required`)
        .max(maxLength, `${label} must be ${maxLength} characters or fewer`);

// Missing, null or blank input becomes undefined.
export const optionalText = (label: string, maxLength: number) =>
    z
        .string({ error: `${label} must be text` })
        .trim()
        .max(maxLength, `${label} must be ${maxLength} characters or fewer`)
        .nullish()
        .transform((text) => text || undefined);

export const productId = z.string().regex(OBJECT_ID_PATTERN, 'Invalid product id');

export const categoryId = (field = 'category') => z.string().regex(CATEGORY_ID_PATTERN, `Invalid ${field}`);

// A whole number from a query string, between `min` and `max`.
const wholeNumber = (min: number, max: number, message: string) =>
    z.coerce.number({ error: message }).int(message).min(min, message).max(max, message);

// The page and limit query parameters of a paginated list.
export const paginationQuery = ({ defaultLimit, maxPageSize }: { defaultLimit: number; maxPageSize: number }) =>
    z.object({
        page: wholeNumber(1, Number.MAX_SAFE_INTEGER, 'Page must be a whole number of 1 or more').default(1),
        limit: wholeNumber(1, maxPageSize, `Limit must be a whole number between 1 and ${maxPageSize}`).default(
            defaultLimit
        ),
    });

export const searchQuery = (maxLength: number) =>
    z
        .string()
        .trim()
        .max(maxLength, `Search must be ${maxLength} characters or fewer`)
        .default('');

// The optional category and subcategory filters of a product list.
// Subcategory ids are only unique within their category, so a subcategory
// filter needs its category too.
export const categoryFilterQuery = z
    .object({
        category: categoryId('category').optional(),
        subcategory: categoryId('subcategory').optional(),
    })
    .refine((query) => !query.subcategory || query.category, {
        message: 'A subcategory filter needs its category',
        path: ['subcategory'],
    });
