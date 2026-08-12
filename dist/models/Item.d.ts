import mongoose, { Document } from 'mongoose';
export interface IItem extends Document {
    name: string;
    category: 'Ingredient' | 'Raw Material' | 'Packaging' | 'Consumable' | string;
    unit: 'kg' | 'g' | 'L' | 'ml' | 'pcs' | 'pack' | string;
    minStockAlert: number;
    currentQuantity: number;
    startingQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const Item: mongoose.Model<IItem, {}, {}, {}, Document<unknown, {}, IItem, {}, mongoose.DefaultSchemaOptions> & IItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IItem>;
export default Item;
//# sourceMappingURL=Item.d.ts.map