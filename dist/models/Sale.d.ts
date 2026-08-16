import mongoose, { Document } from 'mongoose';
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
declare const Sale: mongoose.Model<ISale, {}, {}, {}, mongoose.Document<unknown, {}, ISale, {}, mongoose.DefaultSchemaOptions> & ISale & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISale>;
export default Sale;
//# sourceMappingURL=Sale.d.ts.map