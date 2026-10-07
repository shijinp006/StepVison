import { readText, checkPagination, checkSearch, checkCategoryFilter } from './common.js';
import { PRODUCT_LIMITS } from '../models/Product.js';
import { isCategory, isSubcategoryOf } from '../utils/categories.js';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

// ---------- Field checks ----------

function checkName(raw, errors) {
    const name = readText(raw);

    if (raw === undefined || name === '') {
        errors.name = 'Product name is required';
    } else if (name === null) {
        errors.name = 'Product name must be text';
    } else if (name.length > PRODUCT_LIMITS.nameLength) {
        errors.name = `Product name must be ${PRODUCT_LIMITS.nameLength} characters or fewer`;
    } else {
        return name;
    }
}

function checkPrice(raw, errors) {
    const price = readText(raw);

    if (!price) {
        errors.price = 'Price is required';
    } else if (!PRICE_PATTERN.test(price)) {
        errors.price = 'Price must be a number of 0 or more with at most 2 decimal places';
    } else if (Number(price) > PRODUCT_LIMITS.maxPrice) {
        errors.price = `Price cannot exceed ${PRODUCT_LIMITS.maxPrice}`;
    } else {
        return Number(price);
    }
}

function checkQuantity(raw, errors) {
    const quantity = readText(raw);

    if (!quantity) {
        errors.quantity = 'Quantity is required';
    } else if (!WHOLE_NUMBER_PATTERN.test(quantity)) {
        errors.quantity = 'Quantity must be a whole number of 0 or more';
    } else if (Number(quantity) > PRODUCT_LIMITS.maxQuantity) {
        errors.quantity = `Quantity cannot exceed ${PRODUCT_LIMITS.maxQuantity}`;
    } else {
        return Number(quantity);
    }
}

// Checks the category/subcategory pair against the categories in the database
// and returns { category, subcategory }. An empty subcategory clears it.
function checkCategory(rawCategory, rawSubcategory, errors) {
    const category = readText(rawCategory);

    if (!category) {
        errors.category = 'Category is required';
        return {};
    }
    if (!isCategory(category)) {
        errors.category = `Unknown category "${category}"`;
        return {};
    }

    const subcategory = rawSubcategory === undefined || rawSubcategory === null ? '' : readText(rawSubcategory);

    if (subcategory === null) {
        errors.subcategory = 'Subcategory must be text';
    } else if (subcategory === '') {
        return { category, subcategory: undefined };
    } else if (!isSubcategoryOf(category, subcategory)) {
        errors.subcategory = `Subcategory "${subcategory}" does not belong to category "${category}"`;
    } else {
        return { category, subcategory };
    }
    return {};
}

// ---------- Route validators ----------

export function productIdParams(params) {
    const errors = {};
    if (!OBJECT_ID_PATTERN.test(readText(params.id) ?? '')) errors.id = 'Invalid product id';
    return { value: { id: params.id }, errors };
}

// Builds the body validator for create (every field required) or update
// (only the fields that were sent are checked and returned).
function productBody({ partial }) {
    return (body) => {
        const errors = {};
        const value = {};
        const isSent = (field) => !partial || body[field] !== undefined;

        if (isSent('name')) value.name = checkName(body.name, errors);
        if (isSent('price')) value.price = checkPrice(body.price, errors);
        if (isSent('quantity')) value.quantity = checkQuantity(body.quantity, errors);

        // A subcategory only makes sense with its category, so sending
        // either one means the category is required.
        if (isSent('category') || isSent('subcategory')) {
            Object.assign(value, checkCategory(body.category, body.subcategory, errors));
        }

        return { value, errors };
    };
}

export const createProductBody = productBody({ partial: false });
export const updateProductBody = productBody({ partial: true });

export function listProductsQuery(query) {
    const errors = {};
    const { maxPageSize, searchLength } = PRODUCT_LIMITS;
    const value = {
        ...checkPagination(query, { defaultLimit: 20, maxPageSize }, errors),
        ...checkCategoryFilter(query, errors),
        search: checkSearch(query.search, searchLength, errors),
    };
    return { value, errors };
}
