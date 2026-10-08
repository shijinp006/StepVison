import { z } from 'zod';
import { PRODUCT_LIMITS } from '../models/Product';
import { categoryFilterQuery, paginationQuery, searchQuery } from './common';

// Storefront product list: search by name or code, filter by category,
// subcategory or featured, one page at a time.
export const catalogProductsQuerySchema = paginationQuery({ defaultLimit: 12, maxPageSize: PRODUCT_LIMITS.maxPageSize })
    .extend({
        search: searchQuery(PRODUCT_LIMITS.searchLength),
        featured: z
            .string()
            .optional()
            .transform((value) => value === 'true'),
    })
    .and(categoryFilterQuery);

export type CatalogProductsQuery = z.output<typeof catalogProductsQuerySchema>;
