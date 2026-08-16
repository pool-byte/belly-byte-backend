import { Response } from 'express';
import mongoose from 'mongoose';
import StockUpdate from '../models/StockUpdate';
import Wastage from '../models/Wastage';
import Item from '../models/Item';
import Shift from '../models/Shift';
import Alert from '../models/Alert';
import { AuthRequest } from '../middleware/authMiddleware';
import { getFilePath, resolvePhotoUrl } from '../middleware/uploadMiddleware';
import { sendAdminPushNotification } from '../services/notificationService';

// @desc    Record Opening Stock (bulk or single for shift)
// @route   POST /api/stock/opening
// @access  Private
export const recordOpeningStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shiftId, items } = req.body;
  const userId = (req.user as any)?._id;

  try {
    let shift = null;
    if (shiftId && mongoose.Types.ObjectId.isValid(shiftId)) {
      shift = await Shift.findById(shiftId);
    }
    if (!shift) {
      shift = await Shift.findOne({
        workerId: userId,
        status: { $in: ['Opening', 'Live'] },
      } as any);

      if (!shift) {
        shift = await Shift.create({
          workerId: userId,
          status: 'Opening',
          openingStockEntered: false,
        });
      }
    }

    // Build map of uploaded files from req.files (Multer upload.any())
    const filesMap: Record<string, string> = {};
    if (Array.isArray(req.files)) {
      (req.files as Express.Multer.File[]).forEach((file) => {
        filesMap[file.fieldname] = getFilePath(file);
      });
    } else if (req.file) {
      filesMap['photo'] = getFilePath(req.file);
    }

    const updates: any[] = [];
    let itemList: any[] = [];
    if (Array.isArray(items)) {
      itemList = items;
    } else if (typeof items === 'string') {
      try {
        itemList = JSON.parse(items);
      } catch {
        itemList = [];
      }
    } else if (items) {
      itemList = [items];
    }

    for (const entry of itemList) {
      const { itemId, quantity } = entry;
      const rawMaterial = await Item.findById(itemId);
      if (rawMaterial) {
        rawMaterial.startingQuantity = Number(quantity);
        rawMaterial.currentQuantity = Number(quantity);
        await rawMaterial.save();

        const itemPhoto =
          filesMap[`itemPhoto_${itemId}`] ||
          req.body[`itemPhoto_${itemId}`] ||
          entry.photoUrl ||
          filesMap['photo'] ||
          '';

        const stockUpdate = await StockUpdate.create({
          shiftId: shift._id,
          itemId,
          workerId: userId,
          type: 'Opening',
          quantity: Number(quantity),
          photoUrl: itemPhoto,
        });
        updates.push(stockUpdate);
      }
    }

    shift.openingStockEntered = true;
    await shift.save();

    res.status(201).json({ message: 'Opening stock recorded successfully', updates });
  } catch (error: any) {
    console.error('Error recording opening stock:', error);
    res.status(500).json({ message: error?.message || 'Server Error', error });
  }
};

// @desc    Record Stock Received mid-shift
// @route   POST /api/stock/received
// @access  Private
export const recordReceivedStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shiftId, itemId, quantity } = req.body;
  const photoUrl = getFilePath(req.file, req.body.photoUrl);
  const userId = (req.user as any)?._id;

  try {
    const rawMaterial = await Item.findById(itemId);
    if (!rawMaterial) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    rawMaterial.currentQuantity += Number(quantity);
    await rawMaterial.save();

    const stockUpdate = await StockUpdate.create({
      shiftId,
      itemId,
      workerId: userId,
      type: 'Received',
      quantity: Number(quantity),
      photoUrl: photoUrl || '',
    });

    res.status(201).json(stockUpdate);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Record wastage
// @route   POST /api/stock/wastage
// @access  Private
export const recordWastage = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shiftId, itemId, quantity, reason, value } = req.body;
  const photoUrl = getFilePath(req.file, req.body.photoUrl);

  try {
    const rawMaterial = await Item.findById(itemId);
    if (!rawMaterial) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    rawMaterial.currentQuantity = rawMaterial.currentQuantity - Number(quantity);
    await rawMaterial.save();

    // Check if cart stock dropped below refill threshold
    const cartThreshold = rawMaterial.minCartStockAlert ?? rawMaterial.minStockAlert ?? 0;
    if (rawMaterial.currentQuantity <= cartThreshold) {
      const existingAlert = await Alert.findOne({
        itemId: rawMaterial._id,
        type: 'LOW_STOCK_THRESHOLD',
        resolved: false,
      } as any);
      if (!existingAlert) {
        const alertMsg = `CART REFILL ALERT: ${rawMaterial.name} is down to ${rawMaterial.currentQuantity.toFixed(3)} ${rawMaterial.unit} after wastage (Cart Threshold: ${cartThreshold} ${rawMaterial.unit}). Please refill cart.`;
        await Alert.create({
          itemId: rawMaterial._id,
          type: 'LOW_STOCK_THRESHOLD',
          message: alertMsg,
        });
        sendAdminPushNotification('⚠️ Cart Refill Alert (Wastage)', alertMsg, {
          itemId: rawMaterial._id,
          type: 'LOW_STOCK_THRESHOLD',
        });
      }
    }

    const wastage = await Wastage.create({
      shiftId,
      itemId,
      quantity: Number(quantity),
      reason,
      value: value ? Number(value) : 0,
      photoUrl: photoUrl || '',
    });

    res.status(201).json(wastage);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get wastage logs
// @route   GET /api/stock/wastage
// @access  Private
export const getWastageLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wastage = await Wastage.find().populate('itemId', 'name unit category').sort({ createdAt: -1 });
    const resolvedWastage = await Promise.all(
      wastage.map(async (w) => {
        const obj = w.toObject();
        obj.photoUrl = await resolvePhotoUrl(obj.photoUrl);
        return obj;
      })
    );
    res.json(resolvedWastage);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get stock update logs
// @route   GET /api/stock/logs
// @access  Private
export const getStockLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updates = await StockUpdate.find().populate('itemId', 'name unit').populate('workerId', 'name').sort({ createdAt: -1 });
    const wastage = await Wastage.find().populate('itemId', 'name unit').sort({ createdAt: -1 });

    const resolvedUpdates = await Promise.all(
      updates.map(async (u) => {
        const obj = u.toObject();
        obj.photoUrl = await resolvePhotoUrl(obj.photoUrl);
        return obj;
      })
    );

    const resolvedWastage = await Promise.all(
      wastage.map(async (w) => {
        const obj = w.toObject();
        obj.photoUrl = await resolvePhotoUrl(obj.photoUrl);
        return obj;
      })
    );

    res.json({ updates: resolvedUpdates, wastage: resolvedWastage });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
