import { Category, Product } from './types';
import categoriesData from './categories.json';
import productsData from './products.json';

/**
 * Get all categories
 */
export function getCategories(): Category[] {
    return categoriesData as Category[];
}

/**
 * Get a single category by ID
 */
export function getCategoryById(id: string): Category | undefined {
    return categoriesData.find((cat) => cat.id === id) as Category | undefined;
}

/**
 * Get a single category by slug
 */
export function getCategoryBySlug(slug: string): Category | undefined {
    return categoriesData.find((cat) => cat.slug === slug) as Category | undefined;
}

/**
 * Get all products
 */
export function getProducts(): Product[] {
    return productsData as Product[];
}

/**
 * Get active products only
 */
export function getActiveProducts(): Product[] {
    return (productsData as Product[]).filter((product) => product.status === 'active');
}

/**
 * Get featured products
 */
export function getFeaturedProducts(): Product[] {
    return (productsData as Product[]).filter(
        (product) => product.isFeatured && product.status === 'active'
    );
}

/**
 * Get a single product by ID
 */
export function getProductById(id: string): Product | undefined {
    return productsData.find((product) => product.id === id) as Product | undefined;
}

/**
 * Get products by category ID
 */
export function getProductsByCategoryId(categoryId: string): Product[] {
    return (productsData as Product[]).filter(
        (product) => product.categoryId === categoryId && product.status === 'active'
    );
}

/**
 * Get products by subcategory ID
 */
export function getProductsBySubcategoryId(subcategoryId: string): Product[] {
    return (productsData as Product[]).filter(
        (product) => product.subcategoryId === subcategoryId && product.status === 'active'
    );
}

/**
 * Search products by name or code
 */
export function searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return (productsData as Product[]).filter(
        (product) =>
            product.status === 'active' &&
            (product.name.toLowerCase().includes(lowerQuery) ||
                product.code.toLowerCase().includes(lowerQuery))
    );
}
