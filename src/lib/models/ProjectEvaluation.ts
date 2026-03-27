import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectEvaluation extends Document {
  projectId: mongoose.Types.ObjectId;
  evaluatorEmail: string;
  evaluatorName: string;
  rubricId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  score?: number;
  comments?: string;
  criteriaScores: { name: string; score: number; comment?: string }[];
  evaluatedAt?: Date;
  createdAt: Date;
}

const ProjectEvaluationSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  evaluatorEmail: { type: String, required: true },
  evaluatorName: { type: String, required: true },
  rubricId: { type: Schema.Types.ObjectId, ref: 'Rubric' },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'REJECTED'], default: 'PENDING' },
  score: { type: Number },
  comments: { type: String },
  criteriaScores: [{
    name: { type: String, required: true },
    score: { type: Number, required: true },
    comment: { type: String }
  }],
  evaluatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ProjectEvaluation || mongoose.model<IProjectEvaluation>('ProjectEvaluation', ProjectEvaluationSchema);
