import mongoose, { Schema, model, models } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IN_EXECUTION' | 'CLOSED';
  principalInvestigator: string; // Name for UI
  leaderEmail: string; // For ownership/filtering
  projectCallId?: mongoose.Types.ObjectId;
  budget: number;
  startDate: Date;
  endDate?: Date;
  attachments: string[]; // URLs from storage
  // Configurable fields from the ToR/GoogleForm builder
  dynamicData?: Map<string, any>;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_EXECUTION', 'CLOSED'],
    default: 'DRAFT' 
  },
  principalInvestigator: { type: String, required: true },
  leaderEmail: { type: String, required: true, index: true },
  projectCallId: { type: Schema.Types.ObjectId, ref: 'ProjectCall' },
  budget: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  attachments: [{ type: String }],
  dynamicData: { type: Map, of: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
});

// Avoid re-compiling the model if it already exists
const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
