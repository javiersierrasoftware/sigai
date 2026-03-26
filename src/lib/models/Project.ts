import mongoose, { Schema, model, models } from 'mongoose';

export interface IProject {
  title: string;
  description: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  principalInvestigator: string;
  budget: number;
  startDate: Date;
  endDate?: Date;
  attachments: string[]; // URLs from storage
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'review', 'approved', 'rejected'],
    default: 'draft' 
  },
  principalInvestigator: { type: String, required: true },
  budget: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  attachments: [{ type: String }],
}, {
  timestamps: true,
});

// Avoid re-compiling the model if it already exists
const Project = models.Project || model<IProject>('Project', ProjectSchema);

export default Project;
