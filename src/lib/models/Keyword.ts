import mongoose, { Schema, Document } from 'mongoose';

export interface IKeyword extends Document {
  normalized: string; // The unique lowercase, accent-free version
  display: string; // The original cased version (e.g. Educación)
  count: number; // Frequency for autocomplete ranking
  createdAt: Date;
  updatedAt: Date;
}

const KeywordSchema: Schema = new Schema({
  normalized: { type: String, required: true, unique: true, index: true },
  display: { type: String, required: true },
  count: { type: Number, default: 1 },
}, { timestamps: true });

if (mongoose.models.Keyword) {
  delete mongoose.models.Keyword;
}

export default mongoose.model<IKeyword>('Keyword', KeywordSchema);
