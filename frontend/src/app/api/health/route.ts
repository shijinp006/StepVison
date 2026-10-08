import { NextResponse } from 'next/server';
import { connectDB } from '@/server/db';
import { configErrors } from '@/server/env';

// Reports setup problems (names only, never values) so a broken deployment
// can be diagnosed from the browser.
export const dynamic = 'force-dynamic';

export async function GET() {
    if (configErrors.length > 0) {
        return NextResponse.json({ status: 'error', problems: configErrors }, { status: 500 });
    }

    try {
        await connectDB();
        return NextResponse.json({ status: 'ok', database: 'connected' });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ status: 'error', problems: [`Database: ${message}`] }, { status: 500 });
    }
}
