import { adminRoute } from '@/server/http';
import { listAllCategories } from '@/server/services/categories';

// Admin only: every category, without counts, for pickers and labels.
export const dynamic = 'force-dynamic';

export const GET = adminRoute(async () => ({ categories: await listAllCategories() }));
