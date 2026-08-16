import { Request, Response } from 'express';
import Item from '../models/Item';
import Sale from '../models/Sale';
import StockUpdate from '../models/StockUpdate';
import Wastage from '../models/Wastage';
import Shift from '../models/Shift';
import Alert from '../models/Alert';
import ShiftReport from '../models/ShiftReport';
import { convertQuantity } from '../utils/unitConverter';

// Helper to calculate total consumption for an item in a date range
const calculateItemConsumption = async (itemId: string, startDate: Date, endDate: Date) => {
  const sales = await Sale.find({ time: { $gte: startDate, $lte: endDate } }).populate('foodItemId');
  let totalConsumption = 0;

  for (const sale of sales) {
    const foodItem = sale.foodItemId as any;
    if (foodItem && foodItem.ingredients) {
      for (const ing of foodItem.ingredients) {
        if (ing.itemId && ing.itemId.toString() === itemId.toString()) {
          const item = await Item.findById(itemId);
          const rawUsage = ing.quantityUsed * sale.quantity;
          const converted = convertQuantity(rawUsage, ing.unit || 'g', item?.unit || 'kg');
          totalConsumption += converted;
        }
      }
    }
  }
  return totalConsumption;
};

// 1. Live Hourly Sales Report
// @route GET /api/reports/hourly-sales
export const getHourlySalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesToday = await Sale.find({ time: { $gte: today } }).populate('foodItemId', 'name price');

    const hourlyMap: { [hour: number]: { hour: number; totalRevenue: number; itemsSold: { [name: string]: number } } } = {};

    for (let h = 0; h < 24; h++) {
      hourlyMap[h] = { hour: h, totalRevenue: 0, itemsSold: {} };
    }

    salesToday.forEach((sale) => {
      const h = sale.hour;
      const productName = (sale.foodItemId as any)?.name || 'Unknown Product';
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 2. Cumulative / Total Day Sales Report
// @route GET /api/reports/daily-sales
export const getDailySalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesToday = await Sale.find({ time: { $gte: today } }).populate('foodItemId', 'name price');

    let totalRevenue = 0;
    const productSummary: { [name: string]: { quantity: number; revenue: number } } = {};

    salesToday.forEach((sale) => {
      totalRevenue += sale.totalPrice;
      const name = (sale.foodItemId as any)?.name || 'Product';
      if (!productSummary[name]) {
        productSummary[name] = { quantity: 0, revenue: 0 };
      }
      productSummary[name].quantity += sale.quantity;
      productSummary[name].revenue += sale.totalPrice;
    });

    const activeShift = await Shift.findOne({ date: { $gte: today } }).sort({ createdAt: -1 });

    res.json({
      date: today,
      cumulativeSalesTotal: totalRevenue,
      productBreakdown: productSummary,
      confirmedDayTotalSubmitted: activeShift?.dayTotalSalesSubmitted || null,
      reconciled: activeShift?.reconciled || false,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 3. Hourly Remaining Stock Report
// @route GET /api/reports/hourly-stock
export const getHourlyStockReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Item.find({}).sort({ category: 1, name: 1 });

    const report = items.map((item) => {
      let status: 'OK' | 'LOW' | 'CRITICAL' = 'OK';
      if (item.currentQuantity <= 0) {
        status = 'CRITICAL';
      } else if (item.currentQuantity <= item.minStockAlert) {
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 4. Automatic Used Stock Report (% usage)
// @route GET /api/reports/used-stock
export const getUsedStockReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Item.find({});
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const report = [];

    for (const item of items) {
      const receivedUpdates = await StockUpdate.find({
        itemId: item._id,
        type: 'Received',
        time: { $gte: today },
      });
      const receivedStock = receivedUpdates.reduce((acc, u) => acc + u.quantity, 0);

      const recipeConsumption = await calculateItemConsumption((item._id as any).toString(), today, new Date());

      const wastageLogs = await Wastage.find({ itemId: item._id, time: { $gte: today } });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 5. Automatic Expected Closing Stock Report
// Formula: Opening + Received - Recipe Consumption - Wastage = AUTOMATIC EXPECTED CLOSING STOCK
// @route GET /api/reports/expected-closing-stock
export const getExpectedClosingStockReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Item.find({});
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const report = [];

    for (const item of items) {
      const receivedUpdates = await StockUpdate.find({
        itemId: item._id,
        type: 'Received',
        time: { $gte: today },
      });
      const receivedStock = receivedUpdates.reduce((acc, u) => acc + u.quantity, 0);

      const recipeConsumption = await calculateItemConsumption((item._id as any).toString(), today, new Date());

      const wastageLogs = await Wastage.find({ itemId: item._id, time: { $gte: today } });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 6. 7-Day Average Usage Report
// @route GET /api/reports/7day-avg
export const getSevenDayAvgUsageReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await Item.find({});
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const now = new Date();

    const report = [];

    for (const item of items) {
      const consumption = await calculateItemConsumption((item._id as any).toString(), sevenDaysAgo, now);

      const wastageLogs = await Wastage.find({ itemId: item._id, time: { $gte: sevenDaysAgo } });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 7. Daily Closing Report Card (Summary for Owner)
// @route GET /api/reports/daily-closing
export const getDailyClosingReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shift = await Shift.findOne({ date: { $gte: today } })
      .populate('workerId', 'name phone')
      .sort({ createdAt: -1 });

    const salesToday = await Sale.find({ time: { $gte: today } }).populate('foodItemId', 'name price');
    const hourlySalesTotal = salesToday.reduce((acc, s) => acc + s.totalPrice, 0);

    const items = await Item.find({});
    const stockClosingList = [];

    for (const item of items) {
      const receivedUpdates = await StockUpdate.find({
        itemId: item._id,
        type: 'Received',
        time: { $gte: today },
      });
      const receivedStock = receivedUpdates.reduce((acc, u) => acc + u.quantity, 0);
      const recipeConsumption = await calculateItemConsumption((item._id as any).toString(), today, new Date());
      const wastageLogs = await Wastage.find({ itemId: item._id, time: { $gte: today } });
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

    const alertsToday = await Alert.find({ createdAt: { $gte: today } }).populate('itemId', 'name');

    res.json({
      shiftSummary: {
        shiftId: shift?._id,
        workerName: (shift?.workerId as any)?.name || 'N/A',
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 8. Sales Mismatches Report
// @route GET /api/reports/mismatches
export const getSalesMismatchesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const mismatchAlerts = await Alert.find({ type: 'SALES_MISMATCH' }).sort({ createdAt: -1 });
    res.json(mismatchAlerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 9. Historical Date-Wise Shift Reports
// @route GET /api/reports/shift-reports
export const getShiftReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const filter = date ? { dateString: String(date) } : {};
    const reports = await ShiftReport.find(filter).sort({ closedAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 10. Get Single Shift Report by ID
// @route GET /api/reports/shift-reports/:id
export const getShiftReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await ShiftReport.findById(req.params.id);
    if (!report) {
      res.status(404).json({ message: 'Shift report not found' });
      return;
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 11. Get Stocks to Buy (End of Shift Shopping List)
// @route GET /api/reports/stocks-to-buy
export const getStocksToBuyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find the latest shift report
    const latestReport = await ShiftReport.findOne({}).sort({ closedAt: -1 });

    let shoppingList: any[] = [];
    let reportId: string | null = null;
    let shiftInfo = null;

    if (latestReport) {
      reportId = (latestReport._id as any).toString();
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
      const items = await Item.find({}).sort({ category: 1, name: 1 });
      items.forEach((item) => {
        const minInventoryAlert = item.minInventoryStockAlert ?? item.minStockAlert ?? 0;
        if (item.currentQuantity <= minInventoryAlert) {
          const targetBuffer = minInventoryAlert > 0 ? minInventoryAlert * 3 : 5;
          const suggestedQty = Math.max(0, targetBuffer - item.currentQuantity);
          const qtyToBuy = Number(suggestedQty.toFixed(2));
          const estCost = (item as any).unitPrice || 0;

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
            vendorName: (item as any).preferredSupplier || '',
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// 12. Update Stocks to Buy Shopping List
// @route PUT /api/reports/stocks-to-buy/:shiftReportId
export const updateStocksToBuyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shiftReportId } = req.params;
    const { shoppingList } = req.body;

    const report = await ShiftReport.findById(shiftReportId);
    if (!report) {
      res.status(404).json({ message: 'Shift report not found' });
      return;
    }

    if (Array.isArray(shoppingList)) {
      report.shoppingList = shoppingList.map((item: any) => {
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
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

