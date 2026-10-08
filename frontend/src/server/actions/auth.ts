'use server';

import { endSession, refreshSession } from '../auth/session';
import { runAction } from '../http';
import { loginSchema } from '../schemas/auth';
import { parseInput } from '../schemas/common';
import { loginAdmin } from '../services/auth';

// Server actions are public endpoints: every argument is untrusted input and
// is validated here before it reaches a service.

export async function loginAction(credentials: { email: string; password: string }) {
    return runAction(() => loginAdmin(parseInput(loginSchema, credentials)));
}

export async function logoutAction() {
    return runAction(() => endSession());
}

// Called by the admin panel when an access token has expired.
export async function refreshSessionAction() {
    return runAction(() => refreshSession());
}
