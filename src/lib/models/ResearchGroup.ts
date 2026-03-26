import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchGroup extends Document {
  name: string;
  category: 'A1' | 'A' | 'B' | 'C' | 'NC'; // NC = No categorizado
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  gruplacUrl?: string;
  academicPrograms: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ResearchGroupSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    category: { 
      type: String, 
      enum: ['A1', 'A', 'B', 'C', 'NC'], 
      default: 'NC' 
    },
    leaderName: { type: String, required: true },
    leaderEmail: { type: String, required: true },
    leaderPhone: { type: String, required: true },
    gruplacUrl: { type: String },
    academicPrograms: [{ type: Schema.Types.ObjectId, ref: 'AcademicProgram' }],
  },
  { timestamps: true }
);

export default mongoose.models.ResearchGroup || mongoose.model<IResearchGroup>('ResearchGroup', ResearchGroupSchema);
