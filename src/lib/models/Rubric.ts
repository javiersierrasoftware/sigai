import mongoose, { Schema, Document } from 'mongoose';

export interface IRubricCriterion {
  name: string;
  instruction: string;
  maxScore: number;
  commentsEnabled: boolean;
  commentMaxLength: number;
}

export interface IRubric extends Document {
  name: string;
  description?: string;
  criteria: IRubricCriterion[];
  createdAt: Date;
}

// Force clear model from cache in development to pick up schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models.Rubric) {
  delete mongoose.models.Rubric;
}

const RubricSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  criteria: [{
    name: { type: String, required: true },
    instruction: { type: String, default: '' },
    maxScore: { type: Number, required: true, default: 10 },
    commentsEnabled: { type: Boolean, default: true },
    commentMaxLength: { type: Number, default: 1500 }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Rubric || mongoose.model<IRubric>('Rubric', RubricSchema);
