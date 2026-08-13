import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskMaster extends Document {
  title: string;
  type: 'Opening' | 'Closing';
  requiresPhoto: boolean;
  requiresInput?: boolean;
  inputLabel?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskMasterSchema = new Schema<ITaskMaster>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ['Opening', 'Closing'] },
    requiresPhoto: { type: Boolean, default: true },
    requiresInput: { type: Boolean, default: false },
    inputLabel: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TaskMaster = mongoose.model<ITaskMaster>('TaskMaster', taskMasterSchema);
export default TaskMaster;
