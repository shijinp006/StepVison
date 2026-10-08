import 'server-only';
import type {
    AdminCategory,
    AdminCategoryOption,
    CategoryListResponse,
    Subcategory,
} from '@/data/adminTypes';
import { connectDB } from '../db';
import { HttpError } from '../errors';
import { Category, type CategoryFields } from '../models/Category';
import { Product } from '../models/Product';
import type { CategoryInput, ListCategoriesQuery, SubcategoryInput } from '../schemas/category';
import { paginationInfo } from '../utils/listing';
import { slugify } from '../utils/slugify';

const CATEGORY_ORDER = { createdAt: 1, _id: 1 } as const;

const productsUsing = (count: number) => `${count} ${count === 1 ? 'product uses' : 'products use'}`;

const toSubcategory = ({ id, name, slug }: Subcategory): Subcategory => ({ id, name, slug });

export function toCategoryOption(category: CategoryFields): AdminCategoryOption {
    return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? undefined,
        subcategories: category.subcategories.map(toSubcategory),
    };
}

async function findCategory(categoryId: string) {
    const category = await Category.findOne({ id: categoryId });
    if (!category) {
        throw new HttpError(404, 'Category not found');
    }
    return category;
}

// ---------- Reads ----------

// Every category and subcategory, without counts. Feeds the admin's
// category pickers and product labels.
export async function listAllCategories(): Promise<AdminCategoryOption[]> {
    await connectDB();
    const categories = await Category.find().sort(CATEGORY_ORDER).lean();
    return categories.map(toCategoryOption);
}

// One page of categories with their subcategories, plus how many products
// use each.
export async function listCategories({ page, limit }: ListCategoriesQuery): Promise<CategoryListResponse> {
    await connectDB();

    const [categories, total] = await Promise.all([
        Category.find()
            .sort(CATEGORY_ORDER)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Category.countDocuments(),
    ]);
    const counts: { _id: { category: string; subcategory?: string }; count: number }[] = await Product.aggregate([
        { $match: { category: { $in: categories.map((category) => category.id) } } },
        { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
    ]);

    // Subcategory ids are only unique within their category, so they are
    // counted per category/subcategory pair.
    const subcategoryKey = (categoryId: string, subcategoryId: string) => `${categoryId}/${subcategoryId}`;
    const categoryCounts = new Map<string, number>();
    const subcategoryCounts = new Map<string, number>();
    for (const { _id, count } of counts) {
        categoryCounts.set(_id.category, (categoryCounts.get(_id.category) ?? 0) + count);
        if (_id.subcategory) {
            subcategoryCounts.set(subcategoryKey(_id.category, _id.subcategory), count);
        }
    }

    const toAdminCategory = (category: (typeof categories)[number]): AdminCategory => ({
        ...toCategoryOption(category),
        _id: String(category._id),
        productCount: categoryCounts.get(category.id) ?? 0,
        subcategories: category.subcategories.map((sub) => ({
            ...toSubcategory(sub),
            productCount: subcategoryCounts.get(subcategoryKey(category.id, sub.id)) ?? 0,
        })),
    });

    return {
        categories: categories.map(toAdminCategory),
        pagination: paginationInfo(page, limit, total),
    };
}

// ---------- Categories ----------

export async function createCategory({ name, description }: CategoryInput): Promise<AdminCategoryOption> {
    await connectDB();
    const slug = slugify(name);
    const id = `cat-${slug}`;

    // Both id and slug are unique; a generated id can clash with a seeded one
    // (a category named "1" would get "cat-1").
    if (await Category.exists({ $or: [{ slug }, { id }] })) {
        throw new HttpError(409, `A category named "${name}" already exists`);
    }

    const category = await Category.create({ id, name, slug, description });
    return toCategoryOption(category);
}

// Renaming changes the name and slug (so storefront URLs follow the new name)
// but keeps the id, so products stay linked.
export async function updateCategory(categoryId: string, { name, description }: CategoryInput) {
    await connectDB();
    const category = await findCategory(categoryId);
    const slug = slugify(name);

    if (await Category.exists({ slug, id: { $ne: category.id } })) {
        throw new HttpError(409, `A category named "${name}" already exists`);
    }

    category.set({ name, slug, description });
    await category.save();
    return toCategoryOption(category);
}

// Categories in use are kept so no product is left pointing at a missing one.
export async function deleteCategory(categoryId: string) {
    await connectDB();
    const category = await findCategory(categoryId);

    const inUse = await Product.countDocuments({ category: categoryId });
    if (inUse > 0) {
        throw new HttpError(409, `${productsUsing(inUse)} this category. Move or delete them first.`);
    }

    await category.deleteOne();
}

// ---------- Subcategories ----------

export async function createSubcategory(categoryId: string, { name }: SubcategoryInput): Promise<Subcategory> {
    await connectDB();
    const category = await findCategory(categoryId);
    const slug = slugify(name);
    const id = `sub-${category.slug}-${slug}`;

    if (category.subcategories.some((sub) => sub.slug === slug || sub.id === id)) {
        throw new HttpError(409, `"${category.name}" already has a subcategory named "${name}"`);
    }

    const subcategory = { id, name, slug };
    category.subcategories.push(subcategory);
    await category.save();
    return subcategory;
}

export async function updateSubcategory(
    categoryId: string,
    subcategoryId: string,
    { name }: SubcategoryInput
): Promise<Subcategory> {
    await connectDB();
    const category = await Category.findOne({ id: categoryId });
    const subcategory = category?.subcategories.find((sub) => sub.id === subcategoryId);
    if (!category || !subcategory) {
        throw new HttpError(404, 'Subcategory not found');
    }

    const slug = slugify(name);
    if (category.subcategories.some((sub) => sub.slug === slug && sub.id !== subcategoryId)) {
        throw new HttpError(409, `"${category.name}" already has a subcategory named "${name}"`);
    }

    subcategory.set({ name, slug });
    await category.save();
    return toSubcategory(subcategory);
}

export async function deleteSubcategory(categoryId: string, subcategoryId: string) {
    await connectDB();
    const category = await Category.findOne({ id: categoryId, 'subcategories.id': subcategoryId });
    if (!category) {
        throw new HttpError(404, 'Subcategory not found');
    }

    const inUse = await Product.countDocuments({ category: categoryId, subcategory: subcategoryId });
    if (inUse > 0) {
        throw new HttpError(409, `${productsUsing(inUse)} this subcategory. Move or delete them first.`);
    }

    category.set(
        'subcategories',
        category.subcategories.filter((sub) => sub.id !== subcategoryId)
    );
    await category.save();
}
