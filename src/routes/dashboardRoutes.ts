import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, admin, getDashboardSummary);

export default router;
