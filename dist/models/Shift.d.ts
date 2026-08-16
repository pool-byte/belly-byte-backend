import mongoose, { Document } from 'mongoose';
export interface ICartLiveChecklist {
    locationVerified: boolean;
    preparationDone: boolean;
    grillingSetup: boolean;
    chargingLightWorking: boolean;
    cameraActive: boolean;
    cartLiveStatus: boolean;
    livePhotoUrl?: string;
    notes?: string;
}
export interface IClosingChecklist {
    cartLocked: boolean;
    chainLocked: boolean;
    remainingStockPacked: boolean;
    closingPhotoUrl?: string;
    notes?: string;
}
export interface ITaskSubmission {
    taskId?: mongoose.Types.ObjectId;
    title: string;
    type: 'Opening' | 'Closing';
    completed: boolean;
    photoUrl?: string;
    inputValue?: string;
    submittedAt?: Date;
}
export interface IShift extends Document {
    date: Date;
    workerId: mongoose.Types.ObjectId;
    status: 'Opening' | 'Live' | 'Closed';
    goLiveTime?: Date;
    closeTime?: Date;
    openingStockEntered: boolean;
    cartLiveChecklist?: ICartLiveChecklist;
    closingChecklist?: IClosingChecklist;
    taskSubmissions?: ITaskSubmission[];
    dayTotalSalesSubmitted?: number;
    reconciled?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Shift: mongoose.Model<IShift, {}, {}, {}, mongoose.Document<unknown, {}, IShift, {}, mongoose.DefaultSchemaOptions> & IShift & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IShift>;
export default Shift;
//# sourceMappingURL=Shift.d.ts.map