import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  itemId?: mongoose.Types.ObjectId;
  shiftId?: mongoose.Types.ObjectId;
  type: 'LOW_STOCK_THRESHOLD' | '70_PCT_CONSUMPTION' | 'SALES_MISMATCH';
  message: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    type: {
      type: String,
      required: true,
      enum: ['LOW_STOCK_THRESHOLD', '70_PCT_CONSUMPTION', 'SALES_MISMATCH'],
    },
    message: { type: String, required: true },
    resolved: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Alert = mongoose.model<IAlert>('Alert', alertSchema);
export default Alert;
