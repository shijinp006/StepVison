import 'server-only';
import type { AdminProduct, ProductListResponse } from '@/data/adminTypes';
import { connectDB } from '../db';
import { HttpError } from '../errors';
import { Category } from '../models/Category';
import { Product, type ProductFields } from '../models/Product';
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from '../schemas/product';
import { deleteProductImage, saveProductImage } from '../uploads';
import { paginationInfo, textSearchFilter } from '../utils/listing';

type ProductRecord = ProductFields & { _id: unknown };

function toAdminProduct(product: ProductRecord): AdminProduct {
    return {
        _id: String(product._id),
        name: product.name,
        image: { filename: product.image?.filename ?? undefined, url: product.image?.url ?? '' },
        category: product.category,
        subcategory: product.subcategory ?? undefined,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    };
}

// Products store category ids, so make sure they point at a real category
// and one of its own subcategories.
async function checkCategoryExists(categoryId: string, subcategoryId?: string) {
    const category = await Category.findOne({ id: categoryId }, 'subcategories.id').lean();
    if (!category) {
        const message = `Unknown category "${categoryId}"`;
        throw new HttpError(400, message, { category: message });
    }

    if (subcategoryId && !category.subcategories.some((sub) => sub.id === subcategoryId)) {
        const message = `Subcategory "${subcategoryId}" does not belong to category "${categoryId}"`;
        throw new HttpError(400, message, { subcategory: message });
    }
}

async function findProduct(id: string) {
    const product = await Product.findById(id);
    if (!product) {
        throw new HttpError(404, 'Product not found');
    }
    return product;
}

// One page of products matching the search and category filters. The stats
// always cover every product.
export async function listProducts({
    page,
    limit,
    search,
    category,
    subcategory,
}: ListProductsQuery): Promise<ProductListResponse> {
    await connectDB();

    const filter: Record<string, unknown> = {};
    if (search) Object.assign(filter, textSearchFilter(search, ['name', 'code']));
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    const [products, total, count] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Product.countDocuments(filter),
        Product.estimatedDocumentCount(),
    ]);

    return {
        products: products.map(toAdminProduct),
        pagination: paginationInfo(page, limit, total),
        stats: { count },
    };
}

export async function createProduct({ image, ...fields }: CreateProductInput): Promise<AdminProduct> {
    await connectDB();
    await checkCategoryExists(fields.category, fields.subcategory);

    const storedImage = await saveProductImage(image);
    try {
        const product = await Product.create({ ...fields, image: storedImage });
        return toAdminProduct(product);
    } catch (err) {
        deleteProductImage(storedImage.filename);
        throw err;
    }
}

export async function updateProduct(id: string, { image, ...fields }: UpdateProductInput): Promise<AdminProduct> {
    await connectDB();
    const product = await findProduct(id);
    await checkCategoryExists(fields.category, fields.subcategory);

    const oldImage = product.image?.filename;
    const newImage = image ? await saveProductImage(image) : null;

    product.set({ ...fields, ...(newImage && { image: newImage }) });
    try {
        await product.save();
    } catch (err) {
        if (newImage) deleteProductImage(newImage.filename);
        throw err;
    }

    // Only remove the old file once the product points at the new one.
    if (newImage) deleteProductImage(oldImage);

    return toAdminProduct(product);
}

export async function deleteProduct(id: string) {
    await connectDB();
    const product = await findProduct(id);

    await product.deleteOne();
    deleteProductImage(product.image?.filename);
}
