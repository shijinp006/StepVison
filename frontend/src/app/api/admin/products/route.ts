import { adminRoute, queryOf } from '@/server/http';
import { parseInput } from '@/server/schemas/common';
import { listProductsQuerySchema } from '@/server/schemas/product';
import { listProducts } from '@/server/services/products';

// Admin only: ?search=&category=&subcategory=&page=&limit=
// Adding, editing and deleting products are server actions (server/actions/products.ts).
export const dynamic = 'force-dynamic';

export const GET = adminRoute((request) => listProducts(parseInput(listProductsQuerySchema, queryOf(request))));
