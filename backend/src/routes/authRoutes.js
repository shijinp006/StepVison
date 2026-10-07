import { Router } from 'express';
import { login, logout, me } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { validate } from '../middleware/validate.js';
import { loginBody } from '../validators/authValidators.js';

const router = Router();

router.post('/login', validate(loginBody), login);
router.post('/logout', logout);
router.get('/me', verifyToken, me);

export default router;
