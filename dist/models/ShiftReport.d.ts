import mongoose, { Document } from 'mongoose';
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
    totalAvailable: number;
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
    dateString: string;
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
declare const ShiftReport: mongoose.Model<IShiftReport, {}, {}, {}, mongoose.Document<unknown, {}, IShiftReport, {}, mongoose.DefaultSchemaOptions> & IShiftReport & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IShiftReport>;
export default ShiftReport;
//# sourceMappingURL=ShiftReport.d.ts.map