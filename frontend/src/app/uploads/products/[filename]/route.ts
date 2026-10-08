import { NextResponse } from 'next/server';
import { readProductImage } from '@/server/uploads';

// Serves uploaded product images. They are written at runtime, so they
// cannot live in public/ (Next.js only serves what was there at build time).
export const dynamic = 'force-dynamic';

const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;

export async function GET(request: Request, { params }: { params: { filename: string } }) {
    const image = await readProductImage(params.filename);
    if (!image) {
        return new NextResponse('Not found', { status: 404 });
    }

    return new NextResponse(new Uint8Array(image.data), {
        headers: {
            'Content-Type': image.contentType,
            'Cache-Control': `public, max-age=${ONE_WEEK_SECONDS}`,
        },
    });
}
