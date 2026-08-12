import mongoose, { Document, Schema } from 'mongoose';

export interface IWastage extends Document {
  shiftId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  value?: number;
  reason: string;
  photoUrl?: string;
  time: Date;
  createdAt: Date;
  updatedAt: Date;
}

const wastageSchema = new Schema<IWastage>(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true },
    value: { type: Number },
    reason: { type: String, required: true },
    photoUrl: { type: String },
    time: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const Wastage = mongoose.model<IWastage>('Wastage', wastageSchema);
export default Wastage;
