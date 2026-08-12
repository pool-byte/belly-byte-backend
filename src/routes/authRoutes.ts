import express from 'express';
import { loginUser, registerUser, getUserProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/profile', protect, getUserProfile);
router.get('/me', protect, getUserProfile);

export default router;
