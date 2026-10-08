import { z } from 'zod';
import { EMAIL_PATTERN } from './common';

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

export const loginSchema = z.object({
    email: z
        .string({ error: 'Email is required' })
        .trim()
        .toLowerCase()
        .min(1, 'Email is required')
        .max(MAX_EMAIL_LENGTH, 'Enter a valid email address')
        .regex(EMAIL_PATTERN, 'Enter a valid email address'),
    // Passwords are taken as-is: trimming would change what the user typed.
    password: z
        .string({ error: 'Password is required' })
        .min(1, 'Password is required')
        .max(MAX_PASSWORD_LENGTH, `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer`),
});

export type LoginInput = z.output<typeof loginSchema>;
