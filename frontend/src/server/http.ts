import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import type { ActionResult } from '@/data/adminTypes';
import { requireAdmin } from './auth/session';
import { toErrorBody } from './errors';

// ---------- API routes ----------

type RouteHandler<Params> = (request: NextRequest, context: { params: Params }) => Promise<unknown>;

// Wraps a route handler: the handler returns the JSON body, and anything it
// throws becomes { message, errors? } with the right status code.
export function apiRoute<Params = Record<string, never>>(handler: RouteHandler<Params>) {
    return async (request: NextRequest, context: { params: Params }) => {
        try {
            return NextResponse.json(await handler(request, context));
        } catch (err) {
            const { status, ...body } = toErrorBody(err);
            return NextResponse.json(body, { status });
        }
    };
}

// Same, for admin-only routes: the request needs a valid login.
export function adminRoute<Params = Record<string, never>>(handler: RouteHandler<Params>) {
    return apiRoute<Params>(async (request, context) => {
        await requireAdmin();
        return handler(request, context);
    });
}

// The query string as an object. Empty values count as missing.
export function queryOf(request: NextRequest) {
    const entries = Array.from(request.nextUrl.searchParams).filter(([, value]) => value !== '');
    return Object.fromEntries(entries);
}

// ---------- Server actions ----------

// Runs a server action body and returns its result as an ActionResult.
export async function runAction<T>(body: () => Promise<T>): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await body() };
    } catch (err) {
        return { ok: false, ...toErrorBody(err) };
    }
}

// Same, for admin-only actions. The login is checked before any input is read.
export function runAdminAction<T>(body: () => Promise<T>): Promise<ActionResult<T>> {
    return runAction(async () => {
        await requireAdmin();
        return body();
    });
}
