import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  name: string;
  category: 'Ingredient' | 'Raw Material' | 'Packaging' | 'Consumable' | string;
  unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'pack' | string;
  minStockAlert: number; // General / Legacy alert threshold
  minCartStockAlert: number; // Operational alert threshold in cart
  minInventoryStockAlert: number; // Supplier purchase threshold in inventory
  currentQuantity: number;
  startingQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true, default: 'Ingredient' },
    unit: { type: String, required: true, default: 'kg' },
    minStockAlert: { type: Number, required: true, default: 0 },
    minCartStockAlert: { type: Number, default: 0 },
    minInventoryStockAlert: { type: Number, default: 0 },
    currentQuantity: { type: Number, required: true, default: 0 },
    startingQuantity: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Item = mongoose.model<IItem>('Item', itemSchema);
export default Item;
