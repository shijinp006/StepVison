// Validators receive raw input and return { value, errors }, where `errors`
// maps field names to messages (see middleware/validate.js).
//
// The check* helpers read one field: they return the cleaned value, or
// record a message in `errors` and return undefined.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHOLE_NUMBER_PATTERN = /^\d+$/;

// Reads a single text value from JSON or multipart input. Repeated multipart
// fields arrive as arrays and JSON can send objects; neither is accepted.
export function readText(value) {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    return null;
}

// An optional text field. Missing, null or blank input returns undefined.
export function checkOptionalText(raw, { field, label, maxLength }, errors) {
    if (raw === undefined || raw === null) return undefined;

    const text = readText(raw);
    if (text === null) {
        errors[field] = `${label} must be text`;
    } else if (text.length > maxLength) {
        errors[field] = `${label} must be ${maxLength} characters or fewer`;
    } else if (text) {
        return text;
    }
}

// A whole number from a query string, or null if it is not one.
function readWholeNumber(raw) {
    const text = readText(raw) ?? '';
    return WHOLE_NUMBER_PATTERN.test(text) ? Number(text) : null;
}

// The page and limit query parameters of a paginated list. Missing values
// fall back to page 1 and `defaultLimit`.
export function checkPagination(query, { defaultLimit, maxPageSize }, errors) {
    const value = { page: 1, limit: defaultLimit };

    if (query.page !== undefined) {
        const page = readWholeNumber(query.page);
        if (page === null || page < 1) {
            errors.page = 'Page must be a whole number of 1 or more';
        } else {
            value.page = page;
        }
    }

    if (query.limit !== undefined) {
        const limit = readWholeNumber(query.limit);
        if (limit === null || limit < 1 || limit > maxPageSize) {
            errors.limit = `Limit must be a whole number between 1 and ${maxPageSize}`;
        } else {
            value.limit = limit;
        }
    }

    return value;
}

// The optional `search` query parameter. Missing input returns ''.
export function checkSearch(raw, maxLength, errors) {
    if (raw === undefined) return '';

    const search = readText(raw);
    if (search === null) {
        errors.search = 'Search must be text';
    } else if (search.length > maxLength) {
        errors.search = `Search must be ${maxLength} characters or fewer`;
    } else {
        return search;
    }
}

// Category and subcategory ids look like "cat-1" or "sub-1-1", not ObjectIds.
export const CATEGORY_ID_PATTERN = /^[a-z0-9-]{1,150}$/;

// The optional `category` and `subcategory` filters of a product list.
// Subcategory ids are only unique within their category, so a subcategory
// filter needs its category too.
export function checkCategoryFilter(query, errors) {
    const value = {};

    for (const field of ['category', 'subcategory']) {
        if (query[field] === undefined || query[field] === '') continue;

        const id = readText(query[field]);
        if (id === null || !CATEGORY_ID_PATTERN.test(id)) {
            errors[field] = `Invalid ${field}`;
        } else {
            value[field] = id;
        }
    }

    if (value.subcategory && query.category === undefined) {
        errors.subcategory = 'A subcategory filter needs its category';
    }

    return value;
}
