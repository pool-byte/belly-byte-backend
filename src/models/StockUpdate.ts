import mongoose, { Document, Schema } from 'mongoose';

export interface IStockUpdate extends Document {
  shiftId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  type: 'Opening' | 'Received';
  quantity: number;
  photoUrl?: string;
  time: Date;
  createdAt: Date;
  updatedAt: Date;
}

const stockUpdateSchema = new Schema<IStockUpdate>(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['Opening', 'Received'] },
    quantity: { type: Number, required: true },
    photoUrl: { type: String },
    time: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const StockUpdate = mongoose.model<IStockUpdate>('StockUpdate', stockUpdateSchema);
export default StockUpdate;
