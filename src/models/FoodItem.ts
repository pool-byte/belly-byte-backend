import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient {
  itemId: mongoose.Types.ObjectId;
  quantityUsed: number;
  unit: 'g' | 'ml' | 'pcs' | 'kg' | 'L' | 'pack' | string;
}

export interface IFoodItem extends Document {
  name: string;
  price: number;
  ingredients: IIngredient[];
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantityUsed: { type: Number, required: true },
    unit: { type: String, required: true, default: 'g' },
  },
  { _id: false }
);

const foodItemSchema = new Schema<IFoodItem>(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    ingredients: [ingredientSchema],
  },
  { timestamps: true }
);

const FoodItem = mongoose.model<IFoodItem>('FoodItem', foodItemSchema);
export default FoodItem;
