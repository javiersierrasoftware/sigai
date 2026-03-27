import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectCall extends Document {
  title: string;
  code: string;
  year: number;
  budgetPerProject: number;
  targetAudience: string;
  description: string;
  rubricId?: mongoose.Types.ObjectId;
  openingDate: Date;
  closingDate: Date;
  // Campos configurables (Google Form style)
  requiredFields: string[]; // ['Resumen', 'Objetivos', 'Metodologia', 'Tipo Proyecto', ...]
  fieldConfig?: Record<string, { maxChars?: number; isRequired?: boolean }>;
  status: 'ABIERTA' | 'CERRADA' | 'REVISION' | 'HISTORICA';
  createdAt: Date;
}

const ProjectCallSchema: Schema = new Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  year: { type: Number, required: true, default: () => new Date().getFullYear() },
  budgetPerProject: { type: Number, default: 0 },
  targetAudience: { type: String },
  description: { type: String },
  rubricId: { type: Schema.Types.ObjectId, ref: 'Rubric' },
  openingDate: { type: Date, required: true },
  closingDate: { type: Date, required: true },
  requiredFields: [{ type: String }],
  fieldConfig: { 
    type: Schema.Types.Mixed,
    default: {} 
  },
  status: { 
    type: String, 
    enum: ['ABIERTA', 'CERRADA', 'REVISION', 'HISTORICA'], 
    default: 'ABIERTA' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Automatic closing logic is handled at the application layer or via CRON, 
// but we'll include a helper virtual here if needed.

export default mongoose.models.ProjectCall || mongoose.model<IProjectCall>('ProjectCall', ProjectCallSchema);
