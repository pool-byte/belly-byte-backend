import mongoose, { Document, Schema } from 'mongoose';

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

const shiftSchema = new Schema<IShift>(
  {
    date: { type: Date, required: true, default: Date.now },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true, enum: ['Opening', 'Live', 'Closed'], default: 'Opening' },
    goLiveTime: { type: Date },
    closeTime: { type: Date },
    openingStockEntered: { type: Boolean, default: false },
    cartLiveChecklist: {
      locationVerified: { type: Boolean, default: false },
      preparationDone: { type: Boolean, default: false },
      grillingSetup: { type: Boolean, default: false },
      chargingLightWorking: { type: Boolean, default: false },
      cameraActive: { type: Boolean, default: false },
      cartLiveStatus: { type: Boolean, default: false },
      livePhotoUrl: { type: String },
      notes: { type: String },
    },
    closingChecklist: {
      cartLocked: { type: Boolean, default: false },
      chainLocked: { type: Boolean, default: false },
      remainingStockPacked: { type: Boolean, default: false },
      closingPhotoUrl: { type: String },
      notes: { type: String },
    },
    taskSubmissions: [
      {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskMaster' },
        title: { type: String, required: true },
        type: { type: String, required: true, enum: ['Opening', 'Closing'] },
        completed: { type: Boolean, default: false },
        photoUrl: { type: String },
        inputValue: { type: String },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    dayTotalSalesSubmitted: { type: Number },
    reconciled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Shift = mongoose.model<IShift>('Shift', shiftSchema);
export default Shift;
