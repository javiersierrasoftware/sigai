import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicProgram extends Document {
  name: string;
  code: string;
  faculty: mongoose.Types.ObjectId;
  level: 'PREGRADO' | 'POSGRADO' | 'MAESTRIA' | 'DOCTORADO';
  createdAt: Date;
  updatedAt: Date;
}

const AcademicProgramSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
    level: { 
      type: String, 
      enum: ['PREGRADO', 'POSGRADO', 'MAESTRIA', 'DOCTORADO'], 
      default: 'PREGRADO' 
    },
  },
  { timestamps: true }
);

export default mongoose.models.AcademicProgram || mongoose.model<IAcademicProgram>('AcademicProgram', AcademicProgramSchema);
