import mongoose from 'mongoose';
import Shift from '../models/Shift';
import Sale from '../models/Sale';
import StockUpdate from '../models/StockUpdate';
import Wastage from '../models/Wastage';
import Item from '../models/Item';
import FoodItem from '../models/FoodItem';
import ShiftReport from '../models/ShiftReport';
import { convertQuantity } from '../utils/unitConverter';

export const createShiftReport = async (shiftId: string) => {
  const shift = await Shift.findById(shiftId).populate('workerId', 'name');
  if (!shift) return null;

  const closedDate = shift.closeTime || new Date();
  const dateString = new Date(closedDate.getTime() - (closedDate.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];

  const workerName = (shift.workerId as any)?.name || 'Staff';

  // 1. Fetch Sales for this shift
  const sales = await Sale.find({ shiftId }).populate('foodItemId');

  // Items Consumed aggregation
  const consumedMap: Record<string, { foodItemId: any; name: string; price: number; quantitySold: number; totalRevenue: number }> = {};
  let totalRevenue = 0;

  sales.forEach((sale) => {
    const foodItem = sale.foodItemId as any;
    if (!foodItem) return;
    const fId = foodItem._id.toString();

    if (!consumedMap[fId]) {
      consumedMap[fId] = {
        foodItemId: foodItem._id,
        name: foodItem.name,
        price: foodItem.price,
        quantitySold: 0,
        totalRevenue: 0,
      };
    }
    consumedMap[fId].quantitySold += sale.quantity;
    consumedMap[fId].totalRevenue += sale.totalPrice;
    totalRevenue += sale.totalPrice;
  });

  const itemsConsumed = Object.values(consumedMap);

  // 2. Raw Material Usage aggregation from recipes
  const rawMaterialUsageMap: Record<string, { itemId: any; name: string; unit: string; quantityUsed: number }> = {};

  for (const sale of sales) {
    const foodItem = sale.foodItemId as any;
    if (foodItem && Array.isArray(foodItem.ingredients)) {
      for (const ing of foodItem.ingredients) {
        const rawItem = await Item.findById(ing.itemId);
        if (!rawItem) continue;

        const rawId = rawItem._id.toString();
        const usageInRecipeUnit = ing.quantityUsed * sale.quantity;
        const convertedUsage = convertQuantity(
          usageInRecipeUnit,
          ing.unit || 'g',
          rawItem.unit || 'kg'
        );

        if (!rawMaterialUsageMap[rawId]) {
          rawMaterialUsageMap[rawId] = {
            itemId: rawItem._id,
            name: rawItem.name,
            unit: rawItem.unit,
            quantityUsed: 0,
          };
        }
        rawMaterialUsageMap[rawId].quantityUsed += convertedUsage;
      }
    }
  }

  const rawMaterialUsed = Object.values(rawMaterialUsageMap);

  // 3. Stock updates (Opening & Received/Restocked)
  const stockUpdates = await StockUpdate.find({ shiftId });
  const restockMap: Record<string, number> = {};
  const openingMap: Record<string, number> = {};

  stockUpdates.forEach((upd) => {
    const iId = upd.itemId.toString();
    if (upd.type === 'Opening') {
      openingMap[iId] = (openingMap[iId] || 0) + upd.quantity;
    } else if (upd.type === 'Received') {
      restockMap[iId] = (restockMap[iId] || 0) + upd.quantity;
    }
  });

  // 4. Wastage logs
  const wastageLogs = await Wastage.find({ shiftId }).populate('itemId', 'name unit');
  const wastageMap: Record<string, number> = {};
  const materialWastedList: any[] = [];

  wastageLogs.forEach((w) => {
    const itemObj = w.itemId as any;
    const iId = itemObj?._id ? itemObj._id.toString() : w.itemId.toString();
    wastageMap[iId] = (wastageMap[iId] || 0) + w.quantity;

    materialWastedList.push({
      itemId: itemObj?._id || w.itemId,
      name: itemObj?.name || 'Raw Material',
      unit: itemObj?.unit || 'kg',
      quantity: w.quantity,
      reason: w.reason || '',
      photoUrl: w.photoUrl || '',
      createdAt: w.createdAt || w.time,
    });
  });

  // 5. Build Stock Summary (Initial + Restocked = Total Available)
  const allMasterItems = await Item.find({});
  const stockSummary = allMasterItems.map((item) => {
    const iId = item._id.toString();
    const openingStock = openingMap[iId] !== undefined ? openingMap[iId] : item.startingQuantity || 0;
    const totalRestocked = restockMap[iId] || 0;
    const totalAvailable = openingStock + totalRestocked;
    const recipeConsumption = rawMaterialUsageMap[iId]?.quantityUsed || 0;
    const wastage = wastageMap[iId] || 0;
    const expectedClosing = totalAvailable - recipeConsumption - wastage;

    return {
      itemId: item._id,
      name: item.name,
      unit: item.unit,
      openingStock,
      totalRestocked,
      totalAvailable,
      recipeConsumption,
      wastage,
      expectedClosing,
    };
  });

  // 6. Save/Upsert ShiftReport
  const report = await ShiftReport.findOneAndUpdate(
    { shiftId: shift._id },
    {
      shiftId: shift._id,
      dateString,
      date: closedDate,
      workerId: (shift.workerId as any)?._id || shift.workerId || new mongoose.Types.ObjectId(),
      workerName,
      closedAt: closedDate,
      itemsConsumed,
      rawMaterialUsed,
      stockSummary,
      materialWasted: materialWastedList,
      totalRevenue,
      livePhotoUrl: shift.cartLiveChecklist?.livePhotoUrl || '',
      closingPhotoUrl: shift.closingChecklist?.closingPhotoUrl || '',
    },
    { upsert: true, new: true }
  );

  return report;
};
