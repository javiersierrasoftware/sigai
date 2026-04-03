import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicActivity extends Document {
  name: string;
  weeklyHours: number;
  type: 'DOCENCIA' | 'INVESTIGACIÓN' | 'EXTENSIÓN' | 'INSTITUCIONAL';
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
  },
  { timestamps: true }
);

export default mongoose.models.AcademicActivity || mongoose.model<IAcademicActivity>('AcademicActivity', AcademicActivitySchema);
