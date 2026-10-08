'use server';

import { runAdminAction } from '../http';
import { parseInput, productId } from '../schemas/common';
import { createProductSchema, updateProductSchema } from '../schemas/product';
import * as products from '../services/products';

// FormData fields: name, category, subcategory, image (file).

export async function createProductAction(form: FormData) {
    return runAdminAction(() => products.createProduct(parseInput(createProductSchema, Object.fromEntries(form))));
}

export async function updateProductAction(id: string, form: FormData) {
    return runAdminAction(() =>
        products.updateProduct(parseInput(productId, id), parseInput(updateProductSchema, Object.fromEntries(form)))
    );
}

export async function deleteProductAction(id: string) {
    return runAdminAction(() => products.deleteProduct(parseInput(productId, id)));
}
