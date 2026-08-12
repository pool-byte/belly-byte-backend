import mongoose, { Document } from 'mongoose';
export interface IAlert extends Document {
    itemId?: mongoose.Types.ObjectId;
    shiftId?: mongoose.Types.ObjectId;
    type: 'LOW_STOCK_THRESHOLD' | '70_PCT_CONSUMPTION' | 'SALES_MISMATCH';
    message: string;
    resolved: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Alert: mongoose.Model<IAlert, {}, {}, {}, Document<unknown, {}, IAlert, {}, mongoose.DefaultSchemaOptions> & IAlert & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAlert>;
export default Alert;
//# sourceMappingURL=Alert.d.ts.map