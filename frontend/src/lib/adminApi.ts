import type {
    ActionResult,
    AdminCategoryOption,
    AdminSessionInfo,
    CategoryListResponse,
    ProductListResponse,
} from '@/data/adminTypes';
import { loginAction, logoutAction, refreshSessionAction } from '@/server/actions/auth';
import {
    createCategoryAction,
    createSubcategoryAction,
    deleteCategoryAction,
    deleteSubcategoryAction,
    updateCategoryAction,
    updateSubcategoryAction,
} from '@/server/actions/categories';
import { createProductAction, deleteProductAction, updateProductAction } from '@/server/actions/products';
import { ApiError, callAction, getJson } from './http';

export type {
    AdminCategory,
    AdminCategoryOption,
    AdminProduct,
    AdminSessionInfo,
    AdminSubcategory,
    AdminUser,
    CategoryListResponse,
    ProductListResponse,
    ProductStats,
} from '@/data/adminTypes';
export { ApiError, RequestCancelledError } from './http';

export interface ProductListParams {
    search?: string;
    category?: string;
    subcategory?: string;
    page?: number;
    limit?: number;
}

// Every request that finds the access token expired at the same moment
// waits for this one refresh, instead of each starting its own.
let refreshInFlight: Promise<unknown> | null = null;

function refreshTokens() {
    refreshInFlight ??= callAction(refreshSessionAction()).finally(() => {
        refreshInFlight = null;
    });
    return refreshInFlight;
}

// Runs an admin request. A 401 means the access token has expired: the
// tokens are refreshed and the request is sent once more. If the refresh
// itself fails with a 401, the login has really ended.
async function withRefresh<T>(request: () => Promise<T>): Promise<T> {
    try {
        return await request();
    } catch (err) {
        if (!(err instanceof ApiError && err.status === 401)) {
            throw err;
        }
        await refreshTokens();
        return request();
    }
}

const adminGet = <T>(...args: Parameters<typeof getJson>) => withRefresh(() => getJson<T>(...args));

const adminAction = <T>(action: () => Promise<ActionResult<T>>) => withRefresh(() => callAction(action()));

// Everything the admin panel does. Reads go through the /api/admin routes
// (GET, cancellable); changes are server actions. Both throw ApiError, and a
// 401 means the login has ended (an expired access token is refreshed first).
export const adminApi = {
    login: (email: string, password: string) => callAction<AdminSessionInfo>(loginAction({ email, password })),

    logout: () => callAction(logoutAction()),

    listProducts: (params: ProductListParams, signal?: AbortSignal) =>
        adminGet<ProductListResponse>('/api/admin/products', { ...params }, signal),

    // FormData fields: name, category, subcategory, image (file)
    createProduct: (form: FormData) => adminAction(() => createProductAction(form)),

    updateProduct: (id: string, form: FormData) => adminAction(() => updateProductAction(id, form)),

    deleteProduct: (id: string) => adminAction(() => deleteProductAction(id)),

    listCategories: (params: { page: number; limit: number }, signal?: AbortSignal) =>
        adminGet<CategoryListResponse>('/api/admin/categories', params, signal),

    listAllCategories: () => adminGet<{ categories: AdminCategoryOption[] }>('/api/admin/categories/all'),

    createCategory: (body: { name: string; description?: string }) => adminAction(() => createCategoryAction(body)),

    createSubcategory: (categoryId: string, name: string) => adminAction(() => createSubcategoryAction(categoryId, name)),

    updateCategory: (categoryId: string, body: { name: string; description?: string }) =>
        adminAction(() => updateCategoryAction(categoryId, body)),

    updateSubcategory: (categoryId: string, subcategoryId: string, name: string) =>
        adminAction(() => updateSubcategoryAction(categoryId, subcategoryId, name)),

    deleteCategory: (categoryId: string) => adminAction(() => deleteCategoryAction(categoryId)),

    deleteSubcategory: (categoryId: string, subcategoryId: string) =>
        adminAction(() => deleteSubcategoryAction(categoryId, subcategoryId)),
};
