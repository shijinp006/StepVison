import { checkPagination, checkSearch, checkCategoryFilter } from './common.js';
import { PRODUCT_LIMITS } from '../models/Product.js';

// Storefront product list: search by name or code, filter by category,
// subcategory or featured, one page at a time.
export function listCatalogProductsQuery(query) {
    const errors = {};
    const { maxPageSize, searchLength } = PRODUCT_LIMITS;
    const value = {
        ...checkPagination(query, { defaultLimit: 12, maxPageSize }, errors),
        ...checkCategoryFilter(query, errors),
        search: checkSearch(query.search, searchLength, errors),
        featured: query.featured === 'true',
    };
    return { value, errors };
}
