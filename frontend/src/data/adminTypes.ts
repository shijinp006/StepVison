// Shapes shared by the admin API routes, the server actions and the admin UI.

import type { Pagination } from './types';

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
    image: { filename?: string; url: string };
    category: string; // AdminCategory id
    subcategory?: string; // AdminSubcategory id
    createdAt: string;
    updatedAt: string;
}

export interface Subcategory {
    id: string;
    name: string;
    slug: string;
}

// A category as listed for pickers and labels (every category, no counts).
export interface AdminCategoryOption {
    id: string;
    name: string;
    slug: string;
    description?: string;
    subcategories: Subcategory[];
}

export interface AdminSubcategory extends Subcategory {
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

export interface ProductStats {
    count: number;
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

// `errors` maps field names to messages so a form can show them per field.
export interface ErrorBody {
    message: string;
    errors?: Record<string, string>;
}

// What every server action returns. Actions never throw to the client:
// Next.js hides the message of a thrown error in production.
export type ActionResult<T = void> = { ok: true; data: T } | ({ ok: false; status: number } & ErrorBody);
