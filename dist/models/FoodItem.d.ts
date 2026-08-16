import mongoose, { Document } from 'mongoose';
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
declare const FoodItem: mongoose.Model<IFoodItem, {}, {}, {}, mongoose.Document<unknown, {}, IFoodItem, {}, mongoose.DefaultSchemaOptions> & IFoodItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFoodItem>;
export default FoodItem;
//# sourceMappingURL=FoodItem.d.ts.map