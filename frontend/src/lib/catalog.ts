import { CatalogProductList, Category, Product } from '@/data/types';
import { ApiError, getJson, RequestCancelledError } from './http';

// Browser access to the public /api/catalog routes. Server components call
// the catalog service (src/server/services/catalog.ts) directly instead.

// Search and filters for the product list; all run on the server.
export interface CatalogProductQuery {
    search?: string;
    category?: string; // category id
    subcategory?: string; // subcategory id, only together with its category
    featured?: boolean;
    page?: number;
    limit?: number;
}

export const isCancelledRequest = (error: unknown): boolean => error instanceof RequestCancelledError;

// Shows a friendly message instead of the server's.
async function getCatalog<T>(path: string, params?: object, signal?: AbortSignal): Promise<T> {
    try {
        return await getJson<T>(`/api/catalog${path}`, { ...params }, signal);
    } catch (err) {
        if (!(err instanceof ApiError) || err.status === 0) throw err;
        throw new ApiError(err.status, 'Could not load products. Please try again later.');
    }
}

export async function fetchCategories(): Promise<Category[]> {
    const { categories } = await getCatalog<{ categories: Category[] }>('/categories');
    return categories;
}

export function fetchProducts(query: CatalogProductQuery, signal?: AbortSignal): Promise<CatalogProductList> {
    return getCatalog<CatalogProductList>('/products', query, signal);
}

// Returns null when there is no such active product (or the id is malformed).
export async function fetchProduct(id: string, signal?: AbortSignal): Promise<Product | null> {
    try {
        const { product } = await getCatalog<{ product: Product }>(`/products/${encodeURIComponent(id)}`, {}, signal);
        return product;
    } catch (err) {
        if (err instanceof ApiError && (err.status === 404 || err.status === 400)) return null;
        throw err;
    }
}
