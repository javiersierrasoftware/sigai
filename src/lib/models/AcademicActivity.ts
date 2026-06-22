import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicActivity extends Document {
  name: string;
  weeklyHours: number;
  type: 'DOCENCIA' | 'INVESTIGACIÓN' | 'EXTENSIÓN' | 'INSTITUCIONAL';
  multiplierFactor: number;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicActivitySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    weeklyHours: { type: Number, required: true },
    type: { 
      type: String, 
      enum: ['DOCENCIA', 'INVESTIGACIÓN', 'EXTENSIÓN', 'INSTITUCIONAL'], 
      required: true 
    },
    multiplierFactor: { type: Number, default: 1.0 }
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.AcademicActivity;
}

export default mongoose.models.AcademicActivity || mongoose.model<IAcademicActivity>('AcademicActivity', AcademicActivitySchema);
