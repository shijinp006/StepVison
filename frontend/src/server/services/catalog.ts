import 'server-only';
import type { CatalogProductList, Category as CatalogCategory, Product as CatalogProduct } from '@/data/types';
import { connectDB } from '../db';
import { Category } from '../models/Category';
import { Product, type ProductFields } from '../models/Product';
import type { CatalogProductsQuery } from '../schemas/catalog';
import { paginationInfo, textSearchFilter } from '../utils/listing';
import { toCategoryOption } from './categories';

// Public, read-only data for the storefront. Only what the site shows: no
// prices, stock or archived products.

const PRODUCT_FIELDS = 'name code category subcategory brand shortDescription image isFeatured';
const PRODUCT_ORDER = { createdAt: 1, _id: 1 } as const;

type CatalogProductRecord = Pick<
    ProductFields,
    'name' | 'code' | 'category' | 'subcategory' | 'brand' | 'shortDescription' | 'image' | 'isFeatured'
> & { _id: unknown };

// category id -> slug, so each product can link to its category page.
async function loadCategorySlugs() {
    const categories = await Category.find({}, 'id slug').lean();
    return new Map(categories.map((category) => [category.id, category.slug]));
}

function toCatalogProduct(product: CatalogProductRecord, categorySlugs: Map<string, string>): CatalogProduct {
    return {
        id: String(product._id),
        name: product.name,
        code: product.code ?? '',
        categoryId: product.category,
        categorySlug: categorySlugs.get(product.category),
        subcategoryId: product.subcategory ?? undefined,
        brand: product.brand ?? undefined,
        shortDescription: product.shortDescription ?? undefined,
        images: product.image?.url ? [product.image.url] : [],
        isFeatured: product.isFeatured,
    };
}

export async function listCatalogCategories(): Promise<CatalogCategory[]> {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: 1, _id: 1 }).lean();
    return categories.map(toCategoryOption);
}

export async function listCatalogProducts({
    page,
    limit,
    search,
    category,
    subcategory,
    featured,
}: CatalogProductsQuery): Promise<CatalogProductList> {
    await connectDB();

    const filter: Record<string, unknown> = { status: 'active' };
    if (search) Object.assign(filter, textSearchFilter(search, ['name', 'code']));
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (featured) filter.isFeatured = true;

    const [products, total, categorySlugs] = await Promise.all([
        Product.find(filter, PRODUCT_FIELDS)
            .sort(PRODUCT_ORDER)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean<CatalogProductRecord[]>(),
        Product.countDocuments(filter),
        loadCategorySlugs(),
    ]);

    return {
        products: products.map((product) => toCatalogProduct(product, categorySlugs)),
        pagination: paginationInfo(page, limit, total),
    };
}

// Returns null when there is no such active product.
export async function getCatalogProduct(id: string): Promise<CatalogProduct | null> {
    await connectDB();

    const product = await Product.findOne({ _id: id, status: 'active' }, PRODUCT_FIELDS).lean<CatalogProductRecord>();
    if (!product) return null;

    return toCatalogProduct(product, await loadCategorySlugs());
}
