import mongoose, { Document, Schema } from 'mongoose';

export interface IItemConsumed {
  foodItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantitySold: number;
  totalRevenue: number;
}

export interface IRawMaterialUsed {
  itemId: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  quantityUsed: number;
}

export interface IStockSummary {
  itemId: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  openingStock: number;
  totalRestocked: number;
  totalAvailable: number; // initial + all restocks
  recipeConsumption: number;
  wastage: number;
  expectedClosing: number;
}

export interface IMaterialWasted {
  itemId: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  quantity: number;
  reason: string;
  photoUrl?: string;
  createdAt?: Date;
}

export interface IShoppingItem {
  itemId: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  closingStock: number;
  minStockAlert: number;
  suggestedQuantity: number;
  quantityToBuy: number;
  unitCost: number;
  totalCost: number;
  vendorName: string;
  status: 'Pending' | 'Ordered' | 'Delivered';
}

export interface IShiftReport extends Document {
  shiftId: mongoose.Types.ObjectId;
  dateString: string; // YYYY-MM-DD for easy date filtering
  date: Date;
  workerId: mongoose.Types.ObjectId;
  workerName: string;
  closedAt: Date;
  itemsConsumed: IItemConsumed[];
  rawMaterialUsed: IRawMaterialUsed[];
  stockSummary: IStockSummary[];
  materialWasted: IMaterialWasted[];
  shoppingList: IShoppingItem[];
  totalRevenue: number;
  livePhotoUrl?: string;
  closingPhotoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shiftReportSchema = new Schema<IShiftReport>(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true, unique: true },
    dateString: { type: String, required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workerName: { type: String, default: 'Staff' },
    closedAt: { type: Date, default: Date.now },
    itemsConsumed: [
      {
        foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
        name: { type: String, required: true },
        price: { type: Number, default: 0 },
        quantitySold: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
      },
    ],
    rawMaterialUsed: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        name: { type: String, required: true },
        unit: { type: String, default: 'kg' },
        quantityUsed: { type: Number, default: 0 },
      },
    ],
    stockSummary: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        name: { type: String, required: true },
        unit: { type: String, default: 'kg' },
        openingStock: { type: Number, default: 0 },
        totalRestocked: { type: Number, default: 0 },
        totalAvailable: { type: Number, default: 0 },
        recipeConsumption: { type: Number, default: 0 },
        wastage: { type: Number, default: 0 },
        expectedClosing: { type: Number, default: 0 },
      },
    ],
    materialWasted: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        name: { type: String, required: true },
        unit: { type: String, default: 'kg' },
        quantity: { type: Number, default: 0 },
        reason: { type: String, default: '' },
        photoUrl: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    shoppingList: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        name: { type: String, required: true },
        unit: { type: String, default: 'kg' },
        closingStock: { type: Number, default: 0 },
        minStockAlert: { type: Number, default: 0 },
        suggestedQuantity: { type: Number, default: 0 },
        quantityToBuy: { type: Number, default: 0 },
        unitCost: { type: Number, default: 0 },
        totalCost: { type: Number, default: 0 },
        vendorName: { type: String, default: '' },
        status: { type: String, enum: ['Pending', 'Ordered', 'Delivered'], default: 'Pending' },
      },
    ],
    totalRevenue: { type: Number, default: 0 },
    livePhotoUrl: { type: String },
    closingPhotoUrl: { type: String },
  },
  { timestamps: true }
);

const ShiftReport = mongoose.model<IShiftReport>('ShiftReport', shiftReportSchema);
export default ShiftReport;
