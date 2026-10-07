import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { HttpError } from '../utils/HttpError.js';
import { paginationInfo, textSearchFilter } from '../utils/listing.js';

// Public, read-only endpoints for the storefront. They return only what the
// site shows: no prices, stock or archived products.

const CATEGORY_FIELDS = 'id name slug description subcategories';
const PRODUCT_FIELDS = 'name code category subcategory brand shortDescription image isFeatured';
const PRODUCT_ORDER = { createdAt: 1, _id: 1 };

// category id -> slug, so each product can link to its category page.
async function loadCategorySlugs() {
    const categories = await Category.find({}, 'id slug').lean();
    return new Map(categories.map((category) => [category.id, category.slug]));
}

function toCatalogProduct(product, categorySlugs) {
    return {
        id: product._id,
        name: product.name,
        code: product.code,
        categoryId: product.category,
        categorySlug: categorySlugs.get(product.category),
        subcategoryId: product.subcategory,
        brand: product.brand,
        shortDescription: product.shortDescription,
        images: [product.image.url],
        isFeatured: product.isFeatured,
    };
}

export async function listCatalogCategories(req, res) {
    const categories = await Category.find({}, CATEGORY_FIELDS).sort({ createdAt: 1, _id: 1 }).lean();
    res.json({ categories: categories.map(({ _id, ...category }) => category) });
}

export async function listCatalogProducts(req, res) {
    const { page, limit, search, category, subcategory, featured } = req.validated.query;

    const filter = { status: 'active' };
    if (search) Object.assign(filter, textSearchFilter(search, ['name', 'code']));
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (featured) filter.isFeatured = true;

    const [products, total, categorySlugs] = await Promise.all([
        Product.find(filter, PRODUCT_FIELDS).sort(PRODUCT_ORDER).skip((page - 1) * limit).limit(limit).lean(),
        Product.countDocuments(filter),
        loadCategorySlugs(),
    ]);

    res.json({
        products: products.map((product) => toCatalogProduct(product, categorySlugs)),
        pagination: paginationInfo(page, limit, total),
    });
}

export async function getCatalogProduct(req, res) {
    const product = await Product.findOne({ _id: req.validated.params.id, status: 'active' }, PRODUCT_FIELDS).lean();
    if (!product) throw new HttpError(404, 'Product not found');

    const categorySlugs = await loadCategorySlugs();
    res.json({ product: toCatalogProduct(product, categorySlugs) });
}
