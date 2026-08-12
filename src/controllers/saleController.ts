import { Request, Response } from 'express';
import Sale from '../models/Sale';
import FoodItem from '../models/FoodItem';
import Item from '../models/Item';
import Alert from '../models/Alert';
import Shift from '../models/Shift';
import { convertQuantity } from '../utils/unitConverter';

// @desc    Record hourly sales and deduct raw materials with unit conversion & alerts
// @route   POST /api/sales/hourly
// @access  Private
export const recordHourlySale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shiftId, foodItemId, quantity, hour } = req.body;

    if (!shiftId) {
      res.status(400).json({ message: 'Shift ID is required to log sales' });
      return;
    }

    if (!foodItemId) {
      res.status(400).json({ message: 'Food Item ID is required' });
      return;
    }

    const foodItem = await FoodItem.findById(foodItemId);
    if (!foodItem) {
      res.status(404).json({ message: 'Food item / recipe not found' });
      return;
    }

    const saleQuantity = Number(quantity) || 0;
    if (saleQuantity <= 0) {
      res.status(400).json({ message: 'Sale quantity must be greater than zero' });
      return;
    }

    const totalPrice = (foodItem.price || 0) * saleQuantity;
    const saleHour = hour !== undefined ? Number(hour) : new Date().getHours();

    const sale = await Sale.create({
      shiftId,
      foodItemId,
      quantity: saleQuantity,
      totalPrice,
      hour: saleHour,
      time: new Date(),
    });

    // Deduct raw materials using recipe & unit converter
    if (Array.isArray(foodItem.ingredients)) {
      for (const ingredient of foodItem.ingredients) {
        if (!ingredient.itemId) continue;
        const rawMaterial = await Item.findById(ingredient.itemId);

        if (rawMaterial) {
          // Recipe usage in recipe unit (e.g., 35g * 10 = 350g)
          const recipeUsageInRecipeUnit = (ingredient.quantityUsed || 0) * saleQuantity;

          // Convert to inventory item unit (e.g., 350g -> 0.35kg if rawMaterial.unit is 'kg')
          const convertedUsage = convertQuantity(
            recipeUsageInRecipeUnit,
            ingredient.unit || 'g',
            rawMaterial.unit || 'kg'
          );

          rawMaterial.currentQuantity = (rawMaterial.currentQuantity || 0) - convertedUsage;
          await rawMaterial.save();

          // Alert Check 1: Minimum Threshold Alert
          if (rawMaterial.currentQuantity < (rawMaterial.minStockAlert || 0)) {
            const existingAlert = await Alert.findOne({
              itemId: rawMaterial._id,
              type: 'LOW_STOCK_THRESHOLD',
              resolved: false,
            } as any);
            if (!existingAlert) {
              await Alert.create({
                itemId: rawMaterial._id,
                type: 'LOW_STOCK_THRESHOLD',
                message: `LOW STOCK THRESHOLD ALERT: ${rawMaterial.name} has fallen below minimum stock (${rawMaterial.minStockAlert} ${rawMaterial.unit}). Current stock: ${rawMaterial.currentQuantity.toFixed(3)} ${rawMaterial.unit}.`,
              });
            }
          }

          // Alert Check 2: 70% Consumption Alert
          const starting = (rawMaterial.startingQuantity || 0) > 0 ? rawMaterial.startingQuantity : 1;
          const totalUsed = starting - rawMaterial.currentQuantity;
          const usageRatio = totalUsed / starting;

          if (usageRatio >= 0.70) {
            const existing70Alert = await Alert.findOne({
              itemId: rawMaterial._id,
              type: '70_PCT_CONSUMPTION',
              resolved: false,
            } as any);
            if (!existing70Alert) {
              await Alert.create({
                itemId: rawMaterial._id,
                type: '70_PCT_CONSUMPTION',
                message: `70% CONSUMPTION ALERT: ${rawMaterial.name} has reached ${(usageRatio * 100).toFixed(1)}% consumption. Remaining: ${rawMaterial.currentQuantity.toFixed(3)} ${rawMaterial.unit} out of ${starting} ${rawMaterial.unit}. Replenish cart stock.`,
              });
            }
          }
        }
      }
    }

    res.status(201).json(sale);
  } catch (error: any) {
    console.error('Error in recordHourlySale:', error);
    res.status(500).json({ message: error?.message || 'Server error', error });
  }
};

// @desc    Get hourly sales log
// @route   GET /api/sales/hourly
// @access  Private
export const getHourlySales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shiftId } = req.query;
    const query = shiftId ? { shiftId: String(shiftId) } : {};

    const sales = await Sale.find(query)
      .populate('foodItemId', 'name price')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Owner reconciles Total Day Sales vs Hourly Sales sum
// @route   POST /api/sales/reconcile
// @access  Private/Admin
export const reconcileDailySales = async (req: Request, res: Response): Promise<void> => {
  const { shiftId, confirmedDayTotalSales } = req.body;

  try {
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      res.status(404).json({ message: 'Shift not found' });
      return;
    }

    const sales = await Sale.find({ shiftId });
    const hourlySalesTotal = sales.reduce((acc, s) => acc + s.totalPrice, 0);
    const dayTotal = Number(confirmedDayTotalSales);
    const isMatched = Math.abs(hourlySalesTotal - dayTotal) < 0.01;

    shift.dayTotalSalesSubmitted = dayTotal;
    shift.reconciled = isMatched;
    await shift.save();

    let alertObj = null;

    if (!isMatched) {
      // Create Mismatch Alert
      const diff = Math.abs(hourlySalesTotal - dayTotal);
      alertObj = await Alert.create({
        shiftId: shift._id,
        type: 'SALES_MISMATCH',
        message: `HOURLY VS DAY TOTAL SALES MISMATCH ALERT: Total of hourly sales (₹${hourlySalesTotal.toFixed(2)}) does not match reported total day sales (₹${dayTotal.toFixed(2)}). Discrepancy: ₹${diff.toFixed(2)}.`,
      });
    }

    res.json({
      shiftId,
      hourlySalesTotal,
      confirmedDayTotalSales: dayTotal,
      reconciled: isMatched,
      mismatchAmount: Math.abs(hourlySalesTotal - dayTotal),
      alert: alertObj,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete / Void a sale entry and restore raw material stock
// @route   DELETE /api/sales/:id
// @access  Private
export const deleteSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      res.status(404).json({ message: 'Sale entry not found' });
      return;
    }

    const foodItem = await FoodItem.findById(sale.foodItemId);
    if (foodItem) {
      // Restore raw material stock
      for (const ingredient of foodItem.ingredients) {
        const rawMaterial = await Item.findById(ingredient.itemId);
        if (rawMaterial) {
          const recipeUsageInRecipeUnit = ingredient.quantityUsed * sale.quantity;
          const convertedUsage = convertQuantity(
            recipeUsageInRecipeUnit,
            ingredient.unit || 'g',
            rawMaterial.unit || 'kg'
          );
          rawMaterial.currentQuantity = rawMaterial.currentQuantity + convertedUsage;
          await rawMaterial.save();
        }
      }
    }

    await sale.deleteOne();
    res.json({ message: 'Sale entry voided and inventory restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Update an existing hourly sale entry and adjust raw material stock
// @route   PUT /api/sales/:id
// @access  Private
export const updateSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quantity, hour } = req.body;
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      res.status(404).json({ message: 'Sale entry not found' });
      return;
    }

    const foodItem = await FoodItem.findById(sale.foodItemId);
    if (!foodItem) {
      res.status(404).json({ message: 'Food item not found' });
      return;
    }

    const oldQuantity = sale.quantity;
    const newQuantity = Number(quantity);
    const quantityDiff = newQuantity - oldQuantity; // positive if increased, negative if decreased

    if (quantityDiff !== 0) {
      // Adjust raw material stock based on the difference
      for (const ingredient of foodItem.ingredients) {
        const rawMaterial = await Item.findById(ingredient.itemId);
        if (rawMaterial) {
          const recipeUsageInRecipeUnit = ingredient.quantityUsed * quantityDiff;
          const convertedUsage = convertQuantity(
            recipeUsageInRecipeUnit,
            ingredient.unit || 'g',
            rawMaterial.unit || 'kg'
          );

          // Deduct additional usage if quantityDiff > 0, restore if quantityDiff < 0
          rawMaterial.currentQuantity = rawMaterial.currentQuantity - convertedUsage;
          await rawMaterial.save();
        }
      }
    }

    sale.quantity = newQuantity;
    sale.totalPrice = foodItem.price * newQuantity;
    if (hour !== undefined) {
      sale.hour = Number(hour);
    }
    await sale.save();

    res.json({ message: 'Sale entry updated and stock adjusted successfully', sale });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

