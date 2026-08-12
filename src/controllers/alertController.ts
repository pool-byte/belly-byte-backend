import { Request, Response } from 'express';
import Alert from '../models/Alert';

// @desc    Get all active or resolved alerts
// @route   GET /api/alerts
// @access  Private/Admin
export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resolved } = req.query;
    const filter: any = {};
    if (resolved !== undefined) {
      filter.resolved = resolved === 'true';
    }

    const alerts = await Alert.find(filter)
      .populate('itemId', 'name unit minStockAlert currentQuantity')
      .populate('shiftId')
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Resolve an alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private/Admin
export const resolveAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      res.status(404).json({ message: 'Alert not found' });
      return;
    }

    alert.resolved = true;
    const updated = await alert.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
