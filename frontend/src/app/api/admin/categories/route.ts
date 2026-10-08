import { adminRoute, queryOf } from '@/server/http';
import { listCategoriesQuerySchema } from '@/server/schemas/category';
import { parseInput } from '@/server/schemas/common';
import { listCategories } from '@/server/services/categories';

// Admin only: one page of categories with product counts (?page=&limit=).
// Changes are server actions (server/actions/categories.ts).
export const dynamic = 'force-dynamic';

export const GET = adminRoute((request) => listCategories(parseInput(listCategoriesQuerySchema, queryOf(request))));
