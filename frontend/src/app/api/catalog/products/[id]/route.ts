import { HttpError } from '@/server/errors';
import { apiRoute } from '@/server/http';
import { parseInput, productId } from '@/server/schemas/common';
import { getCatalogProduct } from '@/server/services/catalog';

export const dynamic = 'force-dynamic';

export const GET = apiRoute<{ id: string }>(async (request, { params }) => {
    const product = await getCatalogProduct(parseInput(productId, params.id));
    if (!product) {
        throw new HttpError(404, 'Product not found');
    }
    return { product };
});
