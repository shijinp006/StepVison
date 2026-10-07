// Helpers shared by the paginated, searchable list endpoints.

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A case-insensitive "contains" match of `search` against any of `fields`.
export function textSearchFilter(search, fields) {
    const pattern = { $regex: escapeRegex(search), $options: 'i' };
    return { $or: fields.map((field) => ({ [field]: pattern })) };
}

export function paginationInfo(page, limit, total) {
    return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
