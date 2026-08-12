import express from 'express';
import {
  getHourlySalesReport,
  getDailySalesReport,
  getHourlyStockReport,
  getUsedStockReport,
  getExpectedClosingStockReport,
  getSevenDayAvgUsageReport,
  getDailyClosingReport,
  getSalesMismatchesReport,
  getShiftReports,
  getShiftReportById,
} from '../controllers/reportController';
import { getShiftStatusAndPhotos } from '../controllers/shiftController';
import { getAlerts } from '../controllers/alertController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/hourly-sales', protect, admin, getHourlySalesReport);
router.get('/daily-sales', protect, admin, getDailySalesReport);
router.get('/hourly-stock', protect, admin, getHourlyStockReport);
router.get('/used-stock', protect, admin, getUsedStockReport);
router.get('/expected-closing-stock', protect, admin, getExpectedClosingStockReport);
router.get('/7day-avg', protect, admin, getSevenDayAvgUsageReport);
router.get('/daily-closing', protect, admin, getDailyClosingReport);
router.get('/mismatches', protect, admin, getSalesMismatchesReport);
router.get('/shift-status', protect, admin, getShiftStatusAndPhotos);
router.get('/alerts', protect, admin, getAlerts);

// Date-wise Shift Closing Reports
router.get('/shift-reports', protect, admin, getShiftReports);
router.get('/shift-reports/:id', protect, admin, getShiftReportById);

export default router;
