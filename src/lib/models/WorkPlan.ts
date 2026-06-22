import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkPlan extends Document {
  user: mongoose.Types.ObjectId;
  semester: string; // e.g. "2025-2"
  facultyId?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  personalInfo: {
    fullName: string;
    documentNumber: string;
    typeOfBinding: string; // Planta, Ocasional, etc.
    weeks: number; // 22, 16, etc.
    weeklyHours: number; // 40, etc.
  };
  activities: {
    type: 'DOCENCIA' | 'INVESTIGACIÓN' | 'EXTENSIÓN' | 'INSTITUCIONAL';
    name: string;
    weeklyHours: number;
    multiplierFactor: number;
    semesterHours: number;
    description?: string;
    evidenceText?: string;
    evidenceFiles?: string[];
  }[];
  status: 'DRAFT' | 'SUBMITTED' | 'ENDORSED' | 'APPROVED' | 'REJECTED';
  exclusivity?: 'NO' | 'DOCENCIA' | 'INVESTIGACION' | 'EXTENSION' | 'COMISION';
  evaluatorComment?: string;
  evaluatedBy?: mongoose.Types.ObjectId;
  evaluatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkPlanSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    semester: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty' },
    programId: { type: Schema.Types.ObjectId, ref: 'AcademicProgram' },
    personalInfo: {
      fullName: { type: String, required: true },
      documentNumber: { type: String },
      typeOfBinding: { type: String },
      weeks: { type: Number, default: 22 },
      weeklyHours: { type: Number, default: 40 },
    },
    activities: [
      {
        type: { 
          type: String, 
          enum: ['DOCENCIA', 'INVESTIGACIÓN', 'EXTENSIÓN', 'INSTITUCIONAL'], 
          required: true 
        },
        name: { type: String, required: true },
        weeklyHours: { type: Number, required: true },
        multiplierFactor: { type: Number, default: 1.0 },
        semesterHours: { type: Number, required: true },
        description: { type: String },
        evidenceText: { type: String, default: '' },
        evidenceFiles: [{ type: String }],
      }
    ],
    status: { 
      type: String, 
      enum: ['DRAFT', 'SUBMITTED', 'ENDORSED', 'APPROVED', 'REJECTED'], 
      default: 'DRAFT' 
    },
    exclusivity: {
      type: String,
      enum: ['NO', 'DOCENCIA', 'INVESTIGACION', 'EXTENSION', 'COMISION'],
      default: 'NO'
    },
    evaluatorComment: { type: String },
    evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    evaluatedAt: { type: Date },
  },
  { timestamps: true }
);

// Standardize semester sorting by adding index
WorkPlanSchema.index({ user: 1, semester: 1 });

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.WorkPlan;
}

export default mongoose.models.WorkPlan || mongoose.model<IWorkPlan>('WorkPlan', WorkPlanSchema);
