import mongoose, { Document } from 'mongoose';
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
declare const StockUpdate: mongoose.Model<IStockUpdate, {}, {}, {}, mongoose.Document<unknown, {}, IStockUpdate, {}, mongoose.DefaultSchemaOptions> & IStockUpdate & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStockUpdate>;
export default StockUpdate;
//# sourceMappingURL=StockUpdate.d.ts.map