import { Product } from '../models/Product.js';
import { HttpError } from '../utils/HttpError.js';
import { deleteProductImage } from '../middleware/uploadImage.js';
import { paginationInfo, textSearchFilter } from '../utils/listing.js';

const LOW_STOCK_THRESHOLD = 5;

const imageFromFile = (file) => ({ filename: file.filename, url: `/uploads/products/${file.filename}` });

// Request bodies, params and query strings are checked by the validators in
// src/validators before these handlers run; see productRoutes.js.

// One page of products matching the search and category filters. The stats
// always cover the whole inventory.
export async function listProducts(req, res) {
    const { page, limit, search, category, subcategory } = req.validated.query;

    const filter = {};
    if (search) Object.assign(filter, textSearchFilter(search, ['name', 'code']));
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;

    const [products, total, totals] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Product.countDocuments(filter),
        Product.aggregate([
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    inventoryValue: { $sum: { $multiply: ['$price', '$quantity'] } },
                    lowStock: { $sum: { $cond: [{ $lte: ['$quantity', LOW_STOCK_THRESHOLD] }, 1, 0] } },
                },
            },
            { $project: { _id: 0 } },
        ]),
    ]);

    res.json({
        products,
        pagination: paginationInfo(page, limit, total),
        stats: totals[0] || { count: 0, totalQuantity: 0, inventoryValue: 0, lowStock: 0 },
    });
}

export async function getProduct(req, res) {
    const product = await Product.findById(req.validated.params.id);
    if (!product) throw new HttpError(404, 'Product not found');
    res.json({ product });
}

export async function createProduct(req, res) {
    if (!req.file) throw new HttpError(400, 'Product image is required');

    const product = await Product.create({ ...req.validated.body, image: imageFromFile(req.file) });
    res.status(201).json({ product });
}

export async function updateProduct(req, res) {
    const fields = req.validated.body;
    if (Object.keys(fields).length === 0 && !req.file) throw new HttpError(400, 'Nothing to update');

    const product = await Product.findById(req.validated.params.id);
    if (!product) throw new HttpError(404, 'Product not found');

    product.set(fields);

    const oldImage = product.image?.filename;
    if (req.file) product.image = imageFromFile(req.file);

    await product.save();

    // Only remove the old file once the new one is saved.
    if (req.file && oldImage) deleteProductImage(oldImage);

    res.json({ product });
}

export async function deleteProduct(req, res) {
    const product = await Product.findByIdAndDelete(req.validated.params.id);
    if (!product) throw new HttpError(404, 'Product not found');

    deleteProductImage(product.image?.filename);
    res.json({ message: 'Product deleted', id: product._id });
}
