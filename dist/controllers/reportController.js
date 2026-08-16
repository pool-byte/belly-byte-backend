"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStocksToBuyReport = exports.getStocksToBuyReport = exports.getShiftReportById = exports.getShiftReports = exports.getSalesMismatchesReport = exports.getDailyClosingReport = exports.getSevenDayAvgUsageReport = exports.getExpectedClosingStockReport = exports.getUsedStockReport = exports.getHourlyStockReport = exports.getDailySalesReport = exports.getHourlySalesReport = void 0;
const Item_1 = __importDefault(require("../models/Item"));
const Sale_1 = __importDefault(require("../models/Sale"));
const StockUpdate_1 = __importDefault(require("../models/StockUpdate"));
const Wastage_1 = __importDefault(require("../models/Wastage"));
const Shift_1 = __importDefault(require("../models/Shift"));
const Alert_1 = __importDefault(require("../models/Alert"));
const ShiftReport_1 = __importDefault(require("../models/ShiftReport"));
const unitConverter_1 = require("../utils/unitConverter");
// Helper to calculate total consumption for an item in a date range
const calculateItemConsumption = async (itemId, startDate, endDate) => {
    const sales = await Sale_1.default.find({ time: { $gte: startDate, $lte: endDate } }).populate('foodItemId');
    let totalConsumption = 0;
    for (const sale of sales) {
        const foodItem = sale.foodItemId;
        if (foodItem && foodItem.ingredients) {
            for (const ing of foodItem.ingredients) {
                if (ing.itemId && ing.itemId.toString() === itemId.toString()) {
                    const item = await Item_1.default.findById(itemId);
                    const rawUsage = ing.quantityUsed * sale.quantity;
                    const converted = (0, unitConverter_1.convertQuantity)(rawUsage, ing.unit || 'g', item?.unit || 'kg');
                    totalConsumption += converted;
                }
            }
        }
    }
    return totalConsumption;
};
// 1. Live Hourly Sales Report
// @route GET /api/reports/hourly-sales
const getHourlySalesReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const salesToday = await Sale_1.default.find({ time: { $gte: today } }).populate('foodItemId', 'name price');
        const hourlyMap = {};
        for (let h = 0; h < 24; h++) {
            hourlyMap[h] = { hour: h, totalRevenue: 0, itemsSold: {} };
        }
        salesToday.forEach((sale) => {
            const h = sale.hour;
            const productName = sale.foodItemId?.name || 'Unknown Product';
            const slot = hourlyMap[h];
            if (slot) {
                slot.totalRevenue += sale.totalPrice;
                slot.itemsSold[productName] = (slot.itemsSold[productName] || 0) + sale.quantity;
            }
        });
        const report = Object.values(hourlyMap).filter((item) => item.totalRevenue > 0 || Object.keys(item.itemsSold).length > 0);
        res.json({
            date: today,
            totalSalesCountToday: salesToday.length,
            hourlyBreakdown: report,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getHourlySalesReport = getHourlySalesReport;
// 2. Cumulative / Total Day Sales Report
// @route GET /api/reports/daily-sales
const getDailySalesReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const salesToday = await Sale_1.default.find({ time: { $gte: today } }).populate('foodItemId', 'name price');
        let totalRevenue = 0;
        const productSummary = {};
        salesToday.forEach((sale) => {
            totalRevenue += sale.totalPrice;
            const name = sale.foodItemId?.name || 'Product';
            if (!productSummary[name]) {
                productSummary[name] = { quantity: 0, revenue: 0 };
            }
            productSummary[name].quantity += sale.quantity;
            productSummary[name].revenue += sale.totalPrice;
        });
        const activeShift = await Shift_1.default.findOne({ date: { $gte: today } }).sort({ createdAt: -1 });
        res.json({
            date: today,
            cumulativeSalesTotal: totalRevenue,
            productBreakdown: productSummary,
            confirmedDayTotalSubmitted: activeShift?.dayTotalSalesSubmitted || null,
            reconciled: activeShift?.reconciled || false,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getDailySalesReport = getDailySalesReport;
// 3. Hourly Remaining Stock Report
// @route GET /api/reports/hourly-stock
const getHourlyStockReport = async (req, res) => {
    try {
        const items = await Item_1.default.find({}).sort({ category: 1, name: 1 });
        const report = items.map((item) => {
            let status = 'OK';
            if (item.currentQuantity <= 0) {
                status = 'CRITICAL';
            }
            else if (item.currentQuantity <= item.minStockAlert) {
                status = 'LOW';
            }
            return {
                itemId: item._id,
                name: item.name,
                category: item.category,
                unit: item.unit,
                startingQuantity: item.startingQuantity,
                remainingQuantity: item.currentQuantity,
                minStockAlert: item.minStockAlert,
                status,
            };
        });
        res.json({ timestamp: new Date(), items: report });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getHourlyStockReport = getHourlyStockReport;
// 4. Automatic Used Stock Report (% usage)
// @route GET /api/reports/used-stock
const getUsedStockReport = async (req, res) => {
    try {
        const items = await Item_1.default.find({});
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const report = [];
        for (const item of items) {
            const receivedUpdates = await StockUpdate_1.default.find({
                itemId: item._id,
                type: 'Received',
                time: { $gte: today },
            });
            const receivedStock = receivedUpdates.reduce((acc, u) => acc + u.quantity, 0);
            const recipeConsumption = await calculateItemConsumption(item._id.toString(), today, new Date());
            const wastageLogs = await Wastage_1.default.find({ itemId: item._id, time: { $gte: today } });
            const totalWastage = wastageLogs.reduce((acc, w) => acc + w.quantity, 0);
            const totalUsed = recipeConsumption + totalWastage;
            const totalAvailable = item.startingQuantity + receivedStock;
            const usagePercentage = totalAvailable > 0 ? (totalUsed / totalAvailable) * 100 : 0;
            report.push({
                itemId: item._id,
                name: item.name,
                unit: item.unit,
                openingStock: item.startingQuantity,
                receivedStock,
                totalAvailable,
                recipeConsumption: Number(recipeConsumption.toFixed(3)),
                wastage: Number(totalWastage.toFixed(3)),
                totalUsed: Number(totalUsed.toFixed(3)),
                usagePercentage: Number(usagePercentage.toFixed(2)),
            });
        }
        res.json({ date: today, usedStockReport: report });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getUsedStockReport = getUsedStockReport;
// 5. Automatic Expected Closing Stock Report
// Formula: Opening + Received - Recipe Consumption - Wastage = AUTOMATIC EXPECTED CLOSING STOCK
// @route GET /api/reports/expected-closing-stock
const getExpectedClosingStockReport = async (req, res) => {
    try {
        const items = await Item_1.default.find({});
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const report = [];
        for (const item of items) {
            const receivedUpdates = await StockUpdate_1.default.find({
                itemId: item._id,
                type: 'Received',
                time: { $gte: today },
            });
            const receivedStock = receivedUpdates.reduce((acc, u) => acc + u.quantity, 0);
            const recipeConsumption = await calculateItemConsumption(item._id.toString(), today, new Date());
            const wastageLogs = await Wastage_1.default.find({ itemId: item._id, time: { $gte: today } });
            const wastage = wastageLogs.reduce((acc, w) => acc + w.quantity, 0);
            // AUTOMATIC EXPECTED CLOSING STOCK FORMULA
            const expectedClosingStock = item.startingQuantity + receivedStock - recipeConsumption - wastage;
            report.push({
                itemId: item._id,
                name: item.name,
                category: item.category,
                unit: item.unit,
                openingStock: item.startingQuantity,
                receivedStock,
                recipeConsumption: Number(recipeConsumption.toFixed(3)),
                wastage: Number(wastage.toFixed(3)),
                expectedClosingStock: Number(expectedClosingStock.toFixed(3)),
                actualCurrentQuantity: Number(item.currentQuantity.toFixed(3)),
            });
        }
        res.json({
            date: today,
            formula: 'Opening + Received - Recipe Consumption - Wastage = AUTOMATIC EXPECTED CLOSING STOCK',
            expectedClosingStockReport: report,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getExpectedClosingStockReport = getExpectedClosingStockReport;
// 6. 7-Day Average Usage Report
// @route GET /api/reports/7day-avg
const getSevenDayAvgUsageReport = async (req, res) => {
    try {
        const items = await Item_1.default.find({});
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const now = new Date();
        const report = [];
        for (const item of items) {
            const consumption = await calculateItemConsumption(item._id.toString(), sevenDaysAgo, now);
            const wastageLogs = await Wastage_1.default.find({ itemId: item._id, time: { $gte: sevenDaysAgo } });
            const totalWastage = wastageLogs.reduce((acc, w) => acc + w.quantity, 0);
            const total7DayUsage = consumption + totalWastage;
            const dailyAverageUsage = total7DayUsage / 7;
            report.push({
                itemId: item._id,
                name: item.name,
                unit: item.unit,
                total7DayUsage: Number(total7DayUsage.toFixed(3)),
                dailyAverageUsage: Number(dailyAverageUsage.toFixed(3)),
                recommendedMinStock: Number((dailyAverageUsage * 1.2).toFixed(3)),
            });
        }
        res.json({
            period: 'Last 7 Days',
            startDate: sevenDaysAgo,
            endDate: now,
            sevenDayAverageReport: report,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getSevenDayAvgUsageReport = getSevenDayAvgUsageReport;
// 7. Daily Closing Report Card (Summary for Owner)
// @route GET /api/reports/daily-closing
const getDailyClosingReport = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const shift = await Shift_1.default.findOne({ date: { $gte: today } })
            .populate('workerId', 'name phone')
            .sort({ createdAt: -1 });
        const salesToday = await Sale_1.default.find({ time: { $gte: today } }).populate('foodItemId', 'name price');
        const hourlySalesTotal = salesToday.reduce((acc, s) => acc + s.totalPrice, 0);
        const items = await Item_1.default.find({});
        const stockClosingList = [];
        for (const item of items) {
            const receivedUpdates = await StockUpdate_1.default.find({
                itemId: item._id,
                type: 'Received',
                time: { $gte: today },
            });
            const receivedStock = receivedUpdates.reduce((acc, u) => acc + u.quantity, 0);
            const recipeConsumption = await calculateItemConsumption(item._id.toString(), today, new Date());
            const wastageLogs = await Wastage_1.default.find({ itemId: item._id, time: { $gte: today } });
            const wastage = wastageLogs.reduce((acc, w) => acc + w.quantity, 0);
            const expectedClosingStock = item.startingQuantity + receivedStock - recipeConsumption - wastage;
            stockClosingList.push({
                name: item.name,
                unit: item.unit,
                openingStock: item.startingQuantity,
                receivedStock,
                recipeConsumption: Number(recipeConsumption.toFixed(3)),
                wastage: Number(wastage.toFixed(3)),
                expectedClosingStock: Number(expectedClosingStock.toFixed(3)),
            });
        }
        const alertsToday = await Alert_1.default.find({ createdAt: { $gte: today } }).populate('itemId', 'name');
        res.json({
            shiftSummary: {
                shiftId: shift?._id,
                workerName: shift?.workerId?.name || 'N/A',
                shiftStatus: shift?.status || 'No shift today',
                goLiveTime: shift?.goLiveTime,
                closeTime: shift?.closeTime,
                openingStockEntered: shift?.openingStockEntered || false,
            },
            salesSummary: {
                hourlySalesTotal,
                confirmedDayTotalSubmitted: shift?.dayTotalSalesSubmitted || null,
                reconciled: shift?.reconciled || false,
                mismatchAlert: alertsToday.find((a) => a.type === 'SALES_MISMATCH') || null,
            },
            stockClosingSummary: stockClosingList,
            photosAndChecklists: {
                liveChecklist: shift?.cartLiveChecklist,
                closingChecklist: shift?.closingChecklist,
            },
            alertsCount: alertsToday.length,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getDailyClosingReport = getDailyClosingReport;
// 8. Sales Mismatches Report
// @route GET /api/reports/mismatches
const getSalesMismatchesReport = async (req, res) => {
    try {
        const mismatchAlerts = await Alert_1.default.find({ type: 'SALES_MISMATCH' }).sort({ createdAt: -1 });
        res.json(mismatchAlerts);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getSalesMismatchesReport = getSalesMismatchesReport;
// 9. Historical Date-Wise Shift Reports
// @route GET /api/reports/shift-reports
const getShiftReports = async (req, res) => {
    try {
        const { date } = req.query;
        const filter = date ? { dateString: String(date) } : {};
        const reports = await ShiftReport_1.default.find(filter).sort({ closedAt: -1 });
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getShiftReports = getShiftReports;
// 10. Get Single Shift Report by ID
// @route GET /api/reports/shift-reports/:id
const getShiftReportById = async (req, res) => {
    try {
        const report = await ShiftReport_1.default.findById(req.params.id);
        if (!report) {
            res.status(404).json({ message: 'Shift report not found' });
            return;
        }
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getShiftReportById = getShiftReportById;
// 11. Get Stocks to Buy (End of Shift Shopping List)
// @route GET /api/reports/stocks-to-buy
const getStocksToBuyReport = async (req, res) => {
    try {
        // Find the latest shift report
        const latestReport = await ShiftReport_1.default.findOne({}).sort({ closedAt: -1 });
        let shoppingList = [];
        let reportId = null;
        let shiftInfo = null;
        if (latestReport) {
            reportId = latestReport._id.toString();
            shiftInfo = {
                shiftId: latestReport.shiftId,
                workerName: latestReport.workerName,
                closedAt: latestReport.closedAt,
                dateString: latestReport.dateString,
            };
            if (Array.isArray(latestReport.shoppingList) && latestReport.shoppingList.length > 0) {
                shoppingList = latestReport.shoppingList;
            }
        }
        // Fallback: If no shopping list exists in latest report, evaluate current live items against inventory threshold
        if (shoppingList.length === 0) {
            const items = await Item_1.default.find({}).sort({ category: 1, name: 1 });
            items.forEach((item) => {
                const minInventoryAlert = item.minInventoryStockAlert ?? item.minStockAlert ?? 0;
                if (item.currentQuantity <= minInventoryAlert) {
                    const targetBuffer = minInventoryAlert > 0 ? minInventoryAlert * 3 : 5;
                    const suggestedQty = Math.max(0, targetBuffer - item.currentQuantity);
                    const qtyToBuy = Number(suggestedQty.toFixed(2));
                    const estCost = item.unitPrice || 0;
                    shoppingList.push({
                        itemId: item._id,
                        name: item.name,
                        unit: item.unit,
                        closingStock: Number(item.currentQuantity.toFixed(3)),
                        minStockAlert: minInventoryAlert,
                        suggestedQuantity: qtyToBuy,
                        quantityToBuy: qtyToBuy,
                        unitCost: estCost,
                        totalCost: Number((qtyToBuy * estCost).toFixed(2)),
                        vendorName: item.preferredSupplier || '',
                        status: 'Pending',
                    });
                }
            });
        }
        const totalEstimatedCost = shoppingList.reduce((acc, item) => acc + (item.totalCost || 0), 0);
        res.json({
            reportId,
            shiftInfo,
            shoppingList,
            totalEstimatedCost: Number(totalEstimatedCost.toFixed(2)),
            itemCount: shoppingList.length,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.getStocksToBuyReport = getStocksToBuyReport;
// 12. Update Stocks to Buy Shopping List
// @route PUT /api/reports/stocks-to-buy/:shiftReportId
const updateStocksToBuyReport = async (req, res) => {
    try {
        const { shiftReportId } = req.params;
        const { shoppingList } = req.body;
        const report = await ShiftReport_1.default.findById(shiftReportId);
        if (!report) {
            res.status(404).json({ message: 'Shift report not found' });
            return;
        }
        if (Array.isArray(shoppingList)) {
            report.shoppingList = shoppingList.map((item) => {
                const qtyToBuy = Number(item.quantityToBuy) || 0;
                const uCost = Number(item.unitCost) || 0;
                return {
                    itemId: item.itemId,
                    name: item.name,
                    unit: item.unit,
                    closingStock: Number(item.closingStock) || 0,
                    minStockAlert: Number(item.minStockAlert) || 0,
                    suggestedQuantity: Number(item.suggestedQuantity) || 0,
                    quantityToBuy: qtyToBuy,
                    unitCost: uCost,
                    totalCost: Number((qtyToBuy * uCost).toFixed(2)),
                    vendorName: item.vendorName || '',
                    status: item.status || 'Pending',
                };
            });
        }
        await report.save();
        const totalEstimatedCost = report.shoppingList.reduce((acc, item) => acc + (item.totalCost || 0), 0);
        res.json({
            message: 'Shopping list updated successfully',
            reportId: report._id,
            shoppingList: report.shoppingList,
            totalEstimatedCost: Number(totalEstimatedCost.toFixed(2)),
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.updateStocksToBuyReport = updateStocksToBuyReport;
//# sourceMappingURL=reportController.js.map