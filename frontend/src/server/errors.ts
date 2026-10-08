import 'server-only';
import mongoose from 'mongoose';
import type { ErrorBody } from '@/data/adminTypes';

export type FieldErrors = Record<string, string>;

// An error whose message is safe to show to the user.
export class HttpError extends Error {
    constructor(
        public status: number,
        message: string,
        public errors?: FieldErrors
    ) {
        super(message);
    }
}

const isDuplicateKeyError = (err: unknown) => (err as { code?: unknown })?.code === 11000;

// Turns anything thrown by a route handler or server action into a status
// and a message for the client. Unexpected errors are logged, not shown.
export function toErrorBody(err: unknown): ErrorBody & { status: number } {
    if (err instanceof HttpError) {
        return { status: err.status, message: err.message, ...(err.errors && { errors: err.errors }) };
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
        return { status: 400, message: Object.values(errors).join(', '), errors };
    }

    if (err instanceof mongoose.Error.CastError) {
        return { status: 400, message: `Invalid ${err.path}` };
    }

    // Unique index violation, e.g. two requests adding the same category at once.
    if (isDuplicateKeyError(err)) {
        return { status: 409, message: 'That already exists' };
    }

    console.error(err);
    return { status: 500, message: 'Internal server error' };
}
