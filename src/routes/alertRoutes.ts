import express from 'express';
import { getAlerts, resolveAlert } from '../controllers/alertController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, admin, getAlerts);
router.put('/:id/resolve', protect, admin, resolveAlert);

export default router;
