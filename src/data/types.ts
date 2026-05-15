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

export interface Product {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  subcategoryId?: string;
  brand?: string;
  shortDescription?: string;
  images: string[];
  isFeatured: boolean;
  status: 'active' | 'archived';
}

export interface CartItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  imageUrl: string;
}
