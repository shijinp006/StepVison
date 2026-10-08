import { apiRoute, queryOf } from '@/server/http';
import { catalogProductsQuerySchema } from '@/server/schemas/catalog';
import { parseInput } from '@/server/schemas/common';
import { listCatalogProducts } from '@/server/services/catalog';

// Public: ?search=&category=&subcategory=&featured=true&page=&limit=
export const dynamic = 'force-dynamic';

export const GET = apiRoute((request) => listCatalogProducts(parseInput(catalogProductsQuerySchema, queryOf(request))));
