import mongoose, { Schema, Document } from 'mongoose';

export interface IJournal extends Document {
  name: string;
  issn1: string; // Primario
  issn2?: string; // Secundario/Electrónico
  category?: string; // e.g., A1, A, B, C (Minciencias)
  createdAt: Date;
}

const JournalSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  issn1: { type: String, required: true, unique: true, trim: true },
  issn2: { type: String, trim: true },
  category: { type: String, enum: ['A1', 'A', 'B', 'C', 'NO_CATEGORIZADA'] },
  createdAt: { type: Date, default: Date.now }
});

// To optimize search by ISSN
JournalSchema.index({ issn1: 1, issn2: 1 });

export default mongoose.models.Journal || mongoose.model<IJournal>('Journal', JournalSchema);
