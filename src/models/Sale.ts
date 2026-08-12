import mongoose, { Document, Schema } from 'mongoose';

export interface ISale extends Document {
  shiftId: mongoose.Types.ObjectId;
  foodItemId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: number;
  hour: number;
  time: Date;
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new Schema<ISale>(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    hour: { type: Number, required: true, default: () => new Date().getHours() },
    time: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

const Sale = mongoose.model<ISale>('Sale', saleSchema);
export default Sale;
