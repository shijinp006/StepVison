import { apiRoute } from '@/server/http';
import { listCatalogCategories } from '@/server/services/catalog';

// Public: the storefront reads this. Always served fresh, never cached at build.
export const dynamic = 'force-dynamic';

export const GET = apiRoute(async () => ({ categories: await listCatalogCategories() }));
