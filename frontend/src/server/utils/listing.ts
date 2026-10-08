import type { Pagination } from '@/data/types';

// Helpers shared by the paginated, searchable lists.

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A case-insensitive "contains" match of `search` against any of `fields`.
export function textSearchFilter(search: string, fields: string[]) {
    const pattern = { $regex: escapeRegex(search), $options: 'i' };
    return { $or: fields.map((field) => ({ [field]: pattern })) };
}

export function paginationInfo(page: number, limit: number, total: number): Pagination {
    return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
