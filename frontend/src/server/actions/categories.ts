'use server';

import { runAdminAction } from '../http';
import { categoryIdSchema, categorySchema, subcategoryIdSchema, subcategorySchema } from '../schemas/category';
import { parseInput } from '../schemas/common';
import * as categories from '../services/categories';

type CategoryBody = { name: string; description?: string };

export async function createCategoryAction(body: CategoryBody) {
    return runAdminAction(() => categories.createCategory(parseInput(categorySchema, body)));
}

export async function updateCategoryAction(categoryId: string, body: CategoryBody) {
    return runAdminAction(() =>
        categories.updateCategory(parseInput(categoryIdSchema, categoryId), parseInput(categorySchema, body))
    );
}

export async function deleteCategoryAction(categoryId: string) {
    return runAdminAction(() => categories.deleteCategory(parseInput(categoryIdSchema, categoryId)));
}

export async function createSubcategoryAction(categoryId: string, name: string) {
    return runAdminAction(() =>
        categories.createSubcategory(parseInput(categoryIdSchema, categoryId), parseInput(subcategorySchema, { name }))
    );
}

export async function updateSubcategoryAction(categoryId: string, subcategoryId: string, name: string) {
    return runAdminAction(() =>
        categories.updateSubcategory(
            parseInput(categoryIdSchema, categoryId),
            parseInput(subcategoryIdSchema, subcategoryId),
            parseInput(subcategorySchema, { name })
        )
    );
}

export async function deleteSubcategoryAction(categoryId: string, subcategoryId: string) {
    return runAdminAction(() =>
        categories.deleteSubcategory(
            parseInput(categoryIdSchema, categoryId),
            parseInput(subcategoryIdSchema, subcategoryId)
        )
    );
}
