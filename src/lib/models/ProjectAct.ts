import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectAct extends Document {
  projectId: mongoose.Types.ObjectId;
  type: 'INICIO' | 'SEGUIMIENTO' | 'CIERRE' | 'SUSPENSION';
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  date: Date;
  actNumber?: string;
  summary: string;
  achievements?: string;
  pendingTasks?: string;
  observations?: string;
  budgetExecution?: number;
  progressPercentage?: number;
  attachments: string[]; // URLs from storage
  reviewedBy?: mongoose.Types.ObjectId; // DIUS Admin
  reviewDate?: Date;
  reviewComments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectActSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    type: { 
      type: String, 
      enum: ['INICIO', 'SEGUIMIENTO', 'CIERRE', 'SUSPENSION'], 
      default: 'SEGUIMIENTO' 
    },
    status: { 
      type: String, 
      enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'], 
      default: 'DRAFT' 
    },
    date: { type: Date, default: Date.now },
    actNumber: { type: String },
    summary: { type: String, required: true },
    achievements: { type: String },
    pendingTasks: { type: String },
    observations: { type: String },
    budgetExecution: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    attachments: [{ type: String }],
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewDate: { type: Date },
    reviewComments: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ProjectAct || mongoose.model<IProjectAct>('ProjectAct', ProjectActSchema);
