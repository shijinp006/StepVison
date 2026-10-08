import { z } from 'zod';
import { CATEGORY_LIMITS } from '../models/Category';
import { slugify } from '../utils/slugify';
import { categoryId, optionalText, paginationQuery, requiredText } from './common';

// `label` is "Category" or "Subcategory". The name must produce a slug,
// since the slug is what storefront URLs use.
const name = (label: string) =>
    requiredText(`${label} name`, CATEGORY_LIMITS.nameLength).refine(
        (text) => slugify(text) !== '',
        `${label} name must contain letters or numbers`
    );

export const categorySchema = z.object({
    name: name('Category'),
    description: optionalText('Description', CATEGORY_LIMITS.descriptionLength),
});

export const subcategorySchema = z.object({
    name: name('Subcategory'),
});

export const categoryIdSchema = categoryId('categoryId');
export const subcategoryIdSchema = categoryId('subcategoryId');

export const listCategoriesQuerySchema = paginationQuery({
    defaultLimit: 10,
    maxPageSize: CATEGORY_LIMITS.maxPageSize,
});

export type CategoryInput = z.output<typeof categorySchema>;
export type SubcategoryInput = z.output<typeof subcategorySchema>;
export type ListCategoriesQuery = z.output<typeof listCategoriesQuerySchema>;
