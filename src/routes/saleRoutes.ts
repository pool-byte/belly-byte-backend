import express from 'express';
import {
  recordHourlySale,
  getHourlySales,
  reconcileDailySales,
  deleteSale,
  updateSale,
} from '../controllers/saleController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/hourly')
  .post(protect, recordHourlySale)
  .get(protect, getHourlySales);

router.post('/reconcile', protect, admin, reconcileDailySales);
router.route('/:id')
  .put(protect, updateSale)
  .delete(protect, deleteSale);

// Backwards compatibility endpoint
router.route('/')
  .post(protect, recordHourlySale)
  .get(protect, getHourlySales);

export default router;
