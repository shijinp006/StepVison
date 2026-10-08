/**
 * Data type definitions for StepVision Hotel Supplies
 */

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories?: Subcategory[];
}

// Active products as served by /api/catalog/products.
export interface Product {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  categorySlug?: string;
  subcategoryId?: string;
  brand?: string;
  shortDescription?: string;
  images: string[];
  isFeatured: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  imageUrl: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CatalogProductList {
  products: Product[];
  pagination: Pagination;
}
