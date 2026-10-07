import { EMAIL_PATTERN, readText } from './common.js';

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

export function loginBody(body) {
    const errors = {};
    const email = readText(body.email)?.toLowerCase() ?? '';
    // Passwords are taken as-is: trimming would change what the user typed.
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email) {
        errors.email = 'Email is required';
    } else if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
        errors.email = 'Enter a valid email address';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length > MAX_PASSWORD_LENGTH) {
        errors.password = `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer`;
    }

    return { value: { email, password }, errors };
}
