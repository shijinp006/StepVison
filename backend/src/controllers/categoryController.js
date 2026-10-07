import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { HttpError } from '../utils/HttpError.js';
import { refreshCategoryCache, slugify } from '../utils/categories.js';
import { paginationInfo } from '../utils/listing.js';

const productsUsing = (count) => `${count} ${count === 1 ? 'product uses' : 'products use'}`;

const CATEGORY_ORDER = { createdAt: 1, _id: 1 };

// Every category and subcategory, without counts. Feeds the admin's
// category pickers and product labels.
export async function listAllCategories(req, res) {
    const categories = await Category.find({}, 'id name slug description subcategories').sort(CATEGORY_ORDER).lean();
    res.json({ categories: categories.map(({ _id, ...category }) => category) });
}

// One page of categories with their subcategories, plus how many products
// use each.
export async function listCategories(req, res) {
    const { page, limit } = req.validated.query;

    const [categories, total] = await Promise.all([
        Category.find().sort(CATEGORY_ORDER).skip((page - 1) * limit).limit(limit).lean(),
        Category.countDocuments(),
    ]);
    const counts = await Product.aggregate([
        { $match: { category: { $in: categories.map((category) => category.id) } } },
        { $group: { _id: { category: '$category', subcategory: '$subcategory' }, count: { $sum: 1 } } },
    ]);

    // Subcategory ids are only unique within their category, so they are
    // counted per category/subcategory pair.
    const subcategoryKey = (categoryId, subcategoryId) => `${categoryId}/${subcategoryId}`;
    const categoryCounts = new Map();
    const subcategoryCounts = new Map();
    for (const { _id, count } of counts) {
        categoryCounts.set(_id.category, (categoryCounts.get(_id.category) ?? 0) + count);
        if (_id.subcategory) subcategoryCounts.set(subcategoryKey(_id.category, _id.subcategory), count);
    }

    res.json({
        categories: categories.map((category) => ({
            ...category,
            productCount: categoryCounts.get(category.id) ?? 0,
            subcategories: category.subcategories.map((sub) => ({
                ...sub,
                productCount: subcategoryCounts.get(subcategoryKey(category.id, sub.id)) ?? 0,
            })),
        })),
        pagination: paginationInfo(page, limit, total),
    });
}

export async function createCategory(req, res) {
    const { name, description } = req.validated.body;
    const slug = slugify(name);
    const id = `cat-${slug}`;

    // Both id and slug are unique; a generated id can clash with a seeded one
    // (a category named "1" would get "cat-1").
    if (await Category.exists({ $or: [{ slug }, { id }] })) {
        throw new HttpError(409, `A category named "${name}" already exists`);
    }

    const category = await Category.create({ id, name, slug, description });
    await refreshCategoryCache();
    res.status(201).json({ category: { ...category.toObject(), productCount: 0 } });
}

export async function createSubcategory(req, res) {
    const category = await Category.findOne({ id: req.validated.params.categoryId });
    if (!category) throw new HttpError(404, 'Category not found');

    const { name } = req.validated.body;
    const slug = slugify(name);
    const id = `sub-${category.slug}-${slug}`;

    if (category.subcategories.some((sub) => sub.slug === slug || sub.id === id)) {
        throw new HttpError(409, `"${category.name}" already has a subcategory named "${name}"`);
    }

    const subcategory = { id, name, slug };
    category.subcategories.push(subcategory);
    await category.save();
    await refreshCategoryCache();
    res.status(201).json({ subcategory: { ...subcategory, productCount: 0 } });
}

// Renaming changes the name and slug (so storefront URLs follow the new name)
// but keeps the id, so products stay linked.
export async function updateCategory(req, res) {
    const category = await Category.findOne({ id: req.validated.params.categoryId });
    if (!category) throw new HttpError(404, 'Category not found');

    const { name, description } = req.validated.body;
    const slug = slugify(name);

    if (await Category.exists({ slug, id: { $ne: category.id } })) {
        throw new HttpError(409, `A category named "${name}" already exists`);
    }

    category.set({ name, slug, description });
    await category.save();
    res.json({ category });
}

export async function updateSubcategory(req, res) {
    const { categoryId, subcategoryId } = req.validated.params;
    const category = await Category.findOne({ id: categoryId });
    const subcategory = category?.subcategories.find((sub) => sub.id === subcategoryId);
    if (!subcategory) throw new HttpError(404, 'Subcategory not found');

    const { name } = req.validated.body;
    const slug = slugify(name);

    if (category.subcategories.some((sub) => sub.slug === slug && sub.id !== subcategoryId)) {
        throw new HttpError(409, `"${category.name}" already has a subcategory named "${name}"`);
    }

    subcategory.set({ name, slug });
    await category.save();
    res.json({ subcategory });
}

// Categories in use are kept so no product is left pointing at a missing one.
export async function deleteCategory(req, res) {
    const { categoryId } = req.validated.params;
    const category = await Category.findOne({ id: categoryId });
    if (!category) throw new HttpError(404, 'Category not found');

    const inUse = await Product.countDocuments({ category: categoryId });
    if (inUse > 0) throw new HttpError(409, `${productsUsing(inUse)} this category. Move or delete them first.`);

    await category.deleteOne();
    await refreshCategoryCache();
    res.json({ message: 'Category deleted', id: categoryId });
}

export async function deleteSubcategory(req, res) {
    const { categoryId, subcategoryId } = req.validated.params;
    const category = await Category.findOne({ id: categoryId, 'subcategories.id': subcategoryId });
    if (!category) throw new HttpError(404, 'Subcategory not found');

    const inUse = await Product.countDocuments({ category: categoryId, subcategory: subcategoryId });
    if (inUse > 0) throw new HttpError(409, `${productsUsing(inUse)} this subcategory. Move or delete them first.`);

    category.subcategories = category.subcategories.filter((sub) => sub.id !== subcategoryId);
    await category.save();
    await refreshCategoryCache();
    res.json({ message: 'Subcategory deleted', id: subcategoryId });
}
