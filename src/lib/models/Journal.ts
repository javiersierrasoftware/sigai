import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalValidation {
  date: Date;
  category: string;
  validatorId?: mongoose.Types.ObjectId;
  notes?: string;
  source?: string; // e.g. 'MinCiencias Publindex 2023'
  evidenceUrl?: string; // Support for indexation photo
}

export interface IJournal extends Document {
  name: string;
  issn1: string; // Primary
  issn2?: string; // Electronic/Secondary
  category?: string; // Current or last known category
  validations: IJournalValidation[]; // Historical validations by CIARP
  createdAt: Date;
}

const JournalValidationSchema = new Schema({
  date: { type: Date, required: true, default: Date.now },
  category: { type: String, required: true },
  validatorId: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  source: { type: String },
  evidenceUrl: { type: String }
}, { _id: false });

const JournalSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  issn1: { type: String, required: true, unique: true, trim: true },
  issn2: { type: String, trim: true },
  category: { type: String, enum: ['A1', 'A2', 'A', 'B', 'C', 'NO_CATEGORIZADA', 'NO_INDEXADA'] },
  validations: [JournalValidationSchema],
  createdAt: { type: Date, default: Date.now }
});

// To optimize search by ISSN
JournalSchema.index({ issn1: 1, issn2: 1 });

if (mongoose.models.Journal) {
  delete mongoose.models.Journal;
}

export default mongoose.model<IJournal>('Journal', JournalSchema);
