"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const Shift_1 = __importDefault(require("../models/Shift"));
const StockUpdate_1 = __importDefault(require("../models/StockUpdate"));
const Wastage_1 = __importDefault(require("../models/Wastage"));
const Alert_1 = __importDefault(require("../models/Alert"));
const Sale_1 = __importDefault(require("../models/Sale"));
// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // 1. Get today's shifts & submitted sales
        const shiftsToday = await Shift_1.default.find({
            date: { $gte: today },
        });
        const submittedSalesTotal = shiftsToday.reduce((acc, shift) => {
            return acc + (shift.dayTotalSalesSubmitted || 0);
        }, 0);
        // 2. Get today's hourly sales logs
        const salesToday = await Sale_1.default.find({
            time: { $gte: today },
        }).populate('foodItemId', 'name price');
        const hourlySalesTotalToday = salesToday.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);
        const salesCountToday = salesToday.reduce((acc, sale) => acc + (sale.quantity || 0), 0);
        // 3. Get active shift
        const activeShifts = await Shift_1.default.find({ status: { $in: ['Opening', 'Live'] } })
            .populate('workerId', 'name mobile');
        // 4. Get recent wastage (last 5)
        const recentWastage = await Wastage_1.default.find({})
            .sort({ time: -1 })
            .limit(5)
            .populate('itemId', 'name');
        // 5. Get recent stock updates (last 5)
        const recentStockUpdates = await StockUpdate_1.default.find({})
            .sort({ time: -1 })
            .limit(5)
            .populate('itemId', 'name')
            .populate('workerId', 'name');
        // 6. Get recent shifts
        const recentShifts = await Shift_1.default.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('workerId', 'name');
        // 7. Get unresolved alerts
        const alerts = await Alert_1.default.find({ resolved: false })
            .populate('itemId', 'name');
        res.json({
            totalSalesToday: hourlySalesTotalToday > 0 ? hourlySalesTotalToday : submittedSalesTotal,
            hourlySalesTotalToday,
            salesCountToday,
            activeShifts,
            activeShift: activeShifts[0] || null,
            recentWastage,
            recentStockUpdates,
            recentShifts,
            alerts,
            activeAlertsCount: alerts.length,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getDashboardSummary = getDashboardSummary;
//# sourceMappingURL=dashboardController.js.map