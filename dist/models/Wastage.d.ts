import mongoose, { Document } from 'mongoose';
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
declare const Wastage: mongoose.Model<IWastage, {}, {}, {}, Document<unknown, {}, IWastage, {}, mongoose.DefaultSchemaOptions> & IWastage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWastage>;
export default Wastage;
//# sourceMappingURL=Wastage.d.ts.map