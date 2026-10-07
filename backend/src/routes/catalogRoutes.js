import { Router } from 'express';
import { listCatalogCategories, listCatalogProducts, getCatalogProduct } from '../controllers/catalogController.js';
import { validate } from '../middleware/validate.js';
import { listCatalogProductsQuery } from '../validators/catalogValidators.js';
import { productIdParams } from '../validators/productValidators.js';

// Public: no login needed, the storefront reads these.
const router = Router();

router.get('/categories', listCatalogCategories);
router.get('/products', validate(listCatalogProductsQuery, 'query'), listCatalogProducts);
router.get('/products/:id', validate(productIdParams, 'params'), getCatalogProduct);

export default router;
