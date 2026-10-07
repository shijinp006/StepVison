import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export interface AdminUser {
    id: string;
    email: string;
    name: string;
}

export interface AdminSessionInfo {
    admin: AdminUser;
    deviceId: string;
    expiresAt: string;
}

export interface AdminProduct {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    image: { filename?: string; url: string };
    category: string; // AdminCategory id
    subcategory?: string; // AdminSubcategory id
    createdAt: string;
    updatedAt: string;
}

// A category as listed for pickers and labels (every category, no counts).
export interface AdminCategoryOption {
    id: string;
    name: string;
    slug: string;
    description?: string;
    subcategories: { id: string; name: string; slug: string }[];
}

export interface AdminSubcategory {
    id: string;
    name: string;
    slug: string;
    productCount: number;
}

// A category on the paginated Categories page, with product counts.
export interface AdminCategory {
    _id: string;
    id: string;
    name: string;
    slug: string;
    description?: string;
    productCount: number;
    subcategories: AdminSubcategory[];
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ProductStats {
    count: number;
    totalQuantity: number;
    inventoryValue: number;
    lowStock: number;
}

export interface ProductListResponse {
    products: AdminProduct[];
    pagination: Pagination;
    stats: ProductStats;
}

export interface CategoryListResponse {
    categories: AdminCategory[];
    pagination: Pagination;
}

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

// Thrown when the caller aborted the request (e.g. a newer search replaced
// it). Callers should ignore it rather than show an error.
export class RequestCancelledError extends Error {
    constructor() {
        super('Request cancelled');
    }
}

const DEFAULT_TIMEOUT_MS = 15_000;
const UPLOAD_TIMEOUT_MS = 60_000; // image uploads can be slow

// Every request gives up after its timeout, sends the session cookies and
// can be aborted early through `signal`.
const http = axios.create({
    baseURL: '/api/admin',
    withCredentials: true,
    timeout: DEFAULT_TIMEOUT_MS,
});

// Turns every failure into an ApiError with a message the UI can show, or a
// RequestCancelledError when the caller aborted it.
function toApiError(error: unknown): Error {
    if (axios.isCancel(error)) return new RequestCancelledError();
    if (!axios.isAxiosError(error)) return new ApiError(0, 'Request failed');

    if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
        return new ApiError(0, 'The server took too long to respond. Please try again.');
    }
    if (!error.response) {
        return new ApiError(0, 'Cannot reach the server. Is the backend running?');
    }

    const { status, data } = error.response as { status: number; data?: { message?: string } };
    const fallback = status >= 500 ? 'Server error. Is the backend running?' : 'Request failed';
    return new ApiError(status, data?.message || fallback);
}

http.interceptors.response.use(undefined, (error) => Promise.reject(toApiError(error)));

const get = <T>(url: string, config?: AxiosRequestConfig) => http.get<T>(url, config).then((res) => res.data);
const post = <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    http.post<T>(url, body, config).then((res) => res.data);
const put = <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    http.put<T>(url, body, config).then((res) => res.data);
const del = <T>(url: string) => http.delete<T>(url).then((res) => res.data);

export interface ProductListParams {
    search?: string;
    category?: string;
    subcategory?: string;
    page?: number;
    limit?: number;
}

export const adminApi = {
    login: (email: string, password: string) => post<AdminSessionInfo>('/auth/login', { email, password }),

    logout: () => post<{ message: string }>('/auth/logout'),

    me: () => get<AdminSessionInfo>('/auth/me'),

    // Search and filters run on the server; empty values are left out.
    listProducts: ({ search, category, subcategory, page, limit }: ProductListParams, signal?: AbortSignal) =>
        get<ProductListResponse>('/products/list-products', {
            params: {
                search: search || undefined,
                category: category || undefined,
                subcategory: subcategory || undefined,
                page,
                limit,
            },
            signal,
        }),

    // FormData fields: name, price, quantity, category, subcategory, image (file)
    createProduct: (form: FormData) =>
        post<{ product: AdminProduct }>('/products/add-product', form, { timeout: UPLOAD_TIMEOUT_MS }),

    updateProduct: (id: string, form: FormData) =>
        put<{ product: AdminProduct }>(`/products/update-product/${id}`, form, { timeout: UPLOAD_TIMEOUT_MS }),

    deleteProduct: (id: string) => del<{ message: string; id: string }>(`/products/delete-product/${id}`),

    listCategories: (params: { page: number; limit: number }, signal?: AbortSignal) =>
        get<CategoryListResponse>('/categories', { params, signal }),

    listAllCategories: () => get<{ categories: AdminCategoryOption[] }>('/categories/all'),

    createCategory: (body: { name: string; description?: string }) =>
        post<{ category: AdminCategory }>('/categories', body),

    createSubcategory: (categoryId: string, name: string) =>
        post<{ subcategory: AdminSubcategory }>(`/categories/${categoryId}/subcategories`, { name }),

    updateCategory: (categoryId: string, body: { name: string; description?: string }) =>
        put<{ category: AdminCategory }>(`/categories/${categoryId}`, body),

    updateSubcategory: (categoryId: string, subcategoryId: string, name: string) =>
        put<{ subcategory: AdminSubcategory }>(`/categories/${categoryId}/subcategories/${subcategoryId}`, { name }),

    deleteCategory: (categoryId: string) => del<{ message: string; id: string }>(`/categories/${categoryId}`),

    deleteSubcategory: (categoryId: string, subcategoryId: string) =>
        del<{ message: string; id: string }>(`/categories/${categoryId}/subcategories/${subcategoryId}`),
};
