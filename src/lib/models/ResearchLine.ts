import mongoose, { Schema, Document } from 'mongoose';

export interface IResearchLine extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchLineSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ResearchLine || mongoose.model<IResearchLine>('ResearchLine', ResearchLineSchema);
