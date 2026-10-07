import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const UPLOADS_DIR = path.join(backendRoot, 'uploads');
export const PRODUCT_UPLOADS_DIR = path.join(UPLOADS_DIR, 'products');
