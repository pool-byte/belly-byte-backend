import { Request, Response } from 'express';
import Shift from '../models/Shift';
import StockUpdate from '../models/StockUpdate';
import Wastage from '../models/Wastage';
import Alert from '../models/Alert';
import Sale from '../models/Sale';

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private/Admin
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Get today's shifts & submitted sales
    const shiftsToday = await Shift.find({
      date: { $gte: today },
    });

    const submittedSalesTotal = shiftsToday.reduce((acc, shift) => {
      return acc + (shift.dayTotalSalesSubmitted || 0);
    }, 0);

    // 2. Get today's hourly sales logs
    const salesToday = await Sale.find({
      time: { $gte: today },
    }).populate('foodItemId', 'name price');

    const hourlySalesTotalToday = salesToday.reduce((acc, sale) => acc + (sale.totalPrice || 0), 0);
    const salesCountToday = salesToday.reduce((acc, sale) => acc + (sale.quantity || 0), 0);

    // 3. Get active shift
    const activeShifts = await Shift.find({ status: { $in: ['Opening', 'Live'] } })
      .populate('workerId', 'name mobile');

    // 4. Get recent wastage (last 5)
    const recentWastage = await Wastage.find({})
      .sort({ time: -1 })
      .limit(5)
      .populate('itemId', 'name');

    // 5. Get recent stock updates (last 5)
    const recentStockUpdates = await StockUpdate.find({})
      .sort({ time: -1 })
      .limit(5)
      .populate('itemId', 'name')
      .populate('workerId', 'name');

    // 6. Get recent shifts
    const recentShifts = await Shift.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('workerId', 'name');

    // 7. Get unresolved alerts
    const alerts = await Alert.find({ resolved: false })
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
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
