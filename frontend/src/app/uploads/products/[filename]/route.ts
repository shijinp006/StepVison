import { NextResponse } from 'next/server';
import { readProductImage } from '@/server/uploads';

// Serves uploaded product images from the database. Each upload gets a new
// random filename, so a file never changes and can be cached for good.
export const dynamic = 'force-dynamic';

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export async function GET(request: Request, { params }: { params: { filename: string } }) {
    const image = await readProductImage(params.filename);
    if (!image) {
        return new NextResponse('Not found', { status: 404 });
    }

    return new NextResponse(new Uint8Array(image.data), {
        headers: {
            'Content-Type': image.contentType,
            'Cache-Control': `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
        },
    });
}
