import { readText, checkOptionalText, checkPagination, CATEGORY_ID_PATTERN } from './common.js';
import { CATEGORY_LIMITS } from '../models/Category.js';
import { slugify } from '../utils/categories.js';

const DESCRIPTION = { field: 'description', label: 'Description', maxLength: CATEGORY_LIMITS.descriptionLength };

// `label` is "Category" or "Subcategory".
function checkName(raw, label, errors) {
    const name = readText(raw);

    if (raw === undefined || name === '') {
        errors.name = `${label} name is required`;
    } else if (name === null) {
        errors.name = `${label} name must be text`;
    } else if (name.length > CATEGORY_LIMITS.nameLength) {
        errors.name = `${label} name must be ${CATEGORY_LIMITS.nameLength} characters or fewer`;
    } else if (!slugify(name)) {
        errors.name = `${label} name must contain letters or numbers`;
    } else {
        return name;
    }
}

export function categoryBody(body) {
    const errors = {};
    const value = {
        name: checkName(body.name, 'Category', errors),
        description: checkOptionalText(body.description, DESCRIPTION, errors),
    };
    return { value, errors };
}

export function subcategoryBody(body) {
    const errors = {};
    const value = { name: checkName(body.name, 'Subcategory', errors) };
    return { value, errors };
}

// Checks every id in the route (categoryId, and subcategoryId when present).
export function categoryIdParams(params) {
    const errors = {};
    for (const [name, raw] of Object.entries(params)) {
        if (!CATEGORY_ID_PATTERN.test(readText(raw) ?? '')) errors[name] = `Invalid ${name}`;
    }
    return { value: params, errors };
}

export function listCategoriesQuery(query) {
    const errors = {};
    const value = checkPagination(query, { defaultLimit: 10, maxPageSize: CATEGORY_LIMITS.maxPageSize }, errors);
    return { value, errors };
}
