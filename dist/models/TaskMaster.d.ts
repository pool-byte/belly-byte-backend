import mongoose, { Document } from 'mongoose';
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
declare const TaskMaster: mongoose.Model<ITaskMaster, {}, {}, {}, mongoose.Document<unknown, {}, ITaskMaster, {}, mongoose.DefaultSchemaOptions> & ITaskMaster & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITaskMaster>;
export default TaskMaster;
//# sourceMappingURL=TaskMaster.d.ts.map