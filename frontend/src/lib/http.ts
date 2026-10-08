import type { ActionResult } from '@/data/adminTypes';

// Browser helpers for calling the app's own API routes and server actions.
// Every failure becomes an ApiError with a message the UI can show.

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

// Thrown when the caller aborted the request (e.g. a newer search replaced
// it). Callers should ignore it rather than show an error.
export class RequestCancelledError extends Error {
    constructor() {
        super('Request cancelled');
    }
}

const UNREACHABLE = 'Cannot reach the server. Please check your connection and try again.';

type QueryParams = Record<string, string | number | boolean | undefined>;

// GETs JSON from an API route. Empty params are left out of the query string.
export async function getJson<T>(path: string, params: QueryParams = {}, signal?: AbortSignal): Promise<T> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '' && value !== false) query.set(key, String(value));
    }
    const url = query.toString() ? `${path}?${query}` : path;

    let response: Response;
    try {
        response = await fetch(url, { signal, cache: 'no-store' });
    } catch {
        if (signal?.aborted) throw new RequestCancelledError();
        throw new ApiError(0, UNREACHABLE);
    }

    // An abort can also land while the body is still downloading.
    const body = await response.json().catch(() => null);
    if (signal?.aborted) throw new RequestCancelledError();
    if (!response.ok) {
        const fallback = response.status >= 500 ? 'Server error. Please try again later.' : 'Request failed';
        throw new ApiError(response.status, body?.message || fallback);
    }
    return body as T;
}

// Awaits a server action and returns its data, or throws its error.
export async function callAction<T>(action: Promise<ActionResult<T>>): Promise<T> {
    let result: ActionResult<T>;
    try {
        result = await action;
    } catch {
        throw new ApiError(0, UNREACHABLE);
    }

    if (!result.ok) {
        throw new ApiError(result.status, result.message);
    }
    return result.data;
}
