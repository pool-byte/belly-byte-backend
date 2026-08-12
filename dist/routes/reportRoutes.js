"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportController_1 = require("../controllers/reportController");
const shiftController_1 = require("../controllers/shiftController");
const alertController_1 = require("../controllers/alertController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get('/hourly-sales', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getHourlySalesReport);
router.get('/daily-sales', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getDailySalesReport);
router.get('/hourly-stock', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getHourlyStockReport);
router.get('/used-stock', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getUsedStockReport);
router.get('/expected-closing-stock', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getExpectedClosingStockReport);
router.get('/7day-avg', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getSevenDayAvgUsageReport);
router.get('/daily-closing', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getDailyClosingReport);
router.get('/mismatches', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getSalesMismatchesReport);
router.get('/shift-status', authMiddleware_1.protect, authMiddleware_1.admin, shiftController_1.getShiftStatusAndPhotos);
router.get('/alerts', authMiddleware_1.protect, authMiddleware_1.admin, alertController_1.getAlerts);
// Date-wise Shift Closing Reports
router.get('/shift-reports', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getShiftReports);
router.get('/shift-reports/:id', authMiddleware_1.protect, authMiddleware_1.admin, reportController_1.getShiftReportById);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map