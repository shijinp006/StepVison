import { Category } from '../models/Category.js';

// category id -> Set of its subcategory ids. The product validators are
// synchronous, so they check against this in-memory copy, which is reloaded
// whenever a category or subcategory is added or removed.
let subcategoriesByCategory = new Map();

export async function refreshCategoryCache() {
    const categories = await Category.find({}, 'id subcategories.id').lean();
    subcategoriesByCategory = new Map(
        categories.map((category) => [category.id, new Set(category.subcategories.map((sub) => sub.id))])
    );
}

export const isCategory = (id) => subcategoriesByCategory.has(id);

export const isSubcategoryOf = (categoryId, subcategoryId) =>
    subcategoriesByCategory.get(categoryId)?.has(subcategoryId) ?? false;

// "Tabletop & Dining" -> "tabletop-dining"
export const slugify = (text) =>
    text
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
