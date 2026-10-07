import axios from 'axios';
import { Category, Product } from '@/data/types';

export interface CatalogPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CatalogProductList {
    products: Product[];
    pagination: CatalogPagination;
}

// Search and filters for the product list; all run on the backend.
export interface CatalogProductQuery {
    search?: string;
    category?: string; // category id
    subcategory?: string; // subcategory id, only together with its category
    featured?: boolean;
    page?: number;
    limit?: number;
}

// The server calls the backend directly (BACKEND_URL from .env.local); the
// browser goes through the /api/catalog rewrite in next.config.mjs.
const baseUrl = typeof window === 'undefined' ? process.env.BACKEND_URL : '';

export class CatalogError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

const http = axios.create({ baseURL: `${baseUrl}/api/catalog`, timeout: 15_000 });

// Cancelled requests pass through untouched so callers can ignore them
// (see isCancelledRequest); every other failure becomes a CatalogError with
// a message the page can show.
http.interceptors.response.use(undefined, (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0;
    const message =
        status === 0 ? 'Cannot reach the server. Please try again later.' : 'Could not load products. Please try again later.';
    return Promise.reject(new CatalogError(status, message));
});

export const isCancelledRequest = (error: unknown) => axios.isCancel(error);

export async function fetchCategories(): Promise<Category[]> {
    const { data } = await http.get<{ categories: Category[] }>('/categories');
    return data.categories;
}

// Empty filters are left out of the query string.
export async function fetchProducts(query: CatalogProductQuery, signal?: AbortSignal): Promise<CatalogProductList> {
    const { data } = await http.get<CatalogProductList>('/products', {
        params: {
            search: query.search || undefined,
            category: query.category || undefined,
            subcategory: query.subcategory || undefined,
            featured: query.featured || undefined,
            page: query.page,
            limit: query.limit,
        },
        signal,
    });
    return data;
}

// Returns null when there is no such active product (or the id is malformed).
export async function fetchProduct(id: string, signal?: AbortSignal): Promise<Product | null> {
    try {
        const { data } = await http.get<{ product: Product }>(`/products/${encodeURIComponent(id)}`, { signal });
        return data.product;
    } catch (err) {
        if (err instanceof CatalogError && (err.status === 404 || err.status === 400)) return null;
        throw err;
    }
}
