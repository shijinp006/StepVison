import { Router } from 'express';
import {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { uploadProductImage } from '../middleware/uploadImage.js';
import { validate } from '../middleware/validate.js';
import {
    productIdParams,
    listProductsQuery,
    createProductBody,
    updateProductBody,
} from '../validators/productValidators.js';

const router = Router();

// Only a logged-in admin (valid token) can list, add, update or delete
// products. It runs before multer so unauthenticated requests never
// write files to disk.
router.use(verifyToken);

const validId = validate(productIdParams, 'params');

// Form bodies are validated after uploadProductImage, since multer is what
// parses them. The id is checked before multer so a bad id never writes a file.
router.get('/list-products', validate(listProductsQuery, 'query'), listProducts);
router.get('/get-product/:id', validId, getProduct);
router.post('/add-product', uploadProductImage, validate(createProductBody), createProduct);
router.put('/update-product/:id', validId, uploadProductImage, validate(updateProductBody), updateProduct);
router.delete('/delete-product/:id', validId, deleteProduct);

export default router;
