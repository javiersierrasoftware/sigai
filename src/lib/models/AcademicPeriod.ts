import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicPeriod extends Document {
  name: string; // e.g. "2025-1"
  status: 'OPEN' | 'CLOSED';
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicPeriodSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    status: { 
      type: String, 
      enum: ['OPEN', 'CLOSED'], 
      default: 'OPEN' 
    },
    isCurrent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.AcademicPeriod || mongoose.model<IAcademicPeriod>('AcademicPeriod', AcademicPeriodSchema);
