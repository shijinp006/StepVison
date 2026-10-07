import { Router } from 'express';
import {
    listAllCategories,
    listCategories,
    createCategory,
    createSubcategory,
    updateCategory,
    updateSubcategory,
    deleteCategory,
    deleteSubcategory,
} from '../controllers/categoryController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { validate } from '../middleware/validate.js';
import { categoryBody, subcategoryBody, categoryIdParams, listCategoriesQuery } from '../validators/categoryValidators.js';

const router = Router();

// Only a logged-in admin (valid token) can list, add, edit or delete categories.
router.use(verifyToken);

const validIds = validate(categoryIdParams, 'params');

router.get('/', validate(listCategoriesQuery, 'query'), listCategories);
router.get('/all', listAllCategories);
router.post('/', validate(categoryBody), createCategory);
router.post('/:categoryId/subcategories', validIds, validate(subcategoryBody), createSubcategory);
router.put('/:categoryId', validIds, validate(categoryBody), updateCategory);
router.put('/:categoryId/subcategories/:subcategoryId', validIds, validate(subcategoryBody), updateSubcategory);
router.delete('/:categoryId', validIds, deleteCategory);
router.delete('/:categoryId/subcategories/:subcategoryId', validIds, deleteSubcategory);

export default router;
