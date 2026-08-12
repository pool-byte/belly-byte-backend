import express from 'express';
import {
  recordOpeningStock,
  recordReceivedStock,
  recordWastage,
  getWastageLogs,
  getStockLogs,
} from '../controllers/stockController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/opening', protect, upload.any(), recordOpeningStock);
router.post('/received', protect, upload.single('photo'), recordReceivedStock);
router.route('/wastage')
  .post(protect, upload.single('photo'), recordWastage)
  .get(protect, getWastageLogs);

router.get('/logs', protect, getStockLogs);

export default router;
