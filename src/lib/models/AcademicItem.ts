import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthor {
  userId?: mongoose.Types.ObjectId;
  name: string;
  type: 'INTERNAL' | 'EXTERNAL';
}

export interface IAcademicItem extends Document {
  users: mongoose.Types.ObjectId[]; // All internal users associated with this product
  authors: IAuthor[]; // Full list of contributors
  type: 'TITULO' | 'EXPERIENCIA' | 'PRODUCCION' | 'CATEGORIA' | 'PREMIO';
  subtype: string;
  title: string;
  institution?: string;
  date: Date;
  radicationDate?: Date;
  points: number; // Official/Approved Points
  requestedPoints: number; // Suggested Points by teacher
  status: 'REGISTRADO' | 'ENVIADO_CIARP' | 'APROBADO' | 'RECHAZADO' | 'APLAZADO';
  actaId?: mongoose.Types.ObjectId;
  evaluationReason?: string;
  fileUrl?: string;
  totalAuthors?: number;
  metadata: {
    issn?: string;
    journalName?: string;
    journalCategory?: string;
    volume?: string;
    issue?: string;
    doi?: string;
    degreeLevel?: string;
    country?: string;
    city?: string;
    isConvalidated?: boolean;
    referenceId?: string; // Acta/Diploma or similar
    [key: string]: any;
  };
  createdAt: Date;
}

const AcademicItemSchema: Schema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  authors: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    type: { type: String, enum: ['INTERNAL', 'EXTERNAL'], required: true }
  }],
  type: { 
    type: String, 
    enum: ['TITULO', 'EXPERIENCIA', 'PRODUCCION', 'CATEGORIA', 'PREMIO'], 
    required: true 
  },
  subtype: { type: String, required: true },
  title: { type: String, required: true },
  institution: { type: String },
  date: { type: Date, required: true },
  radicationDate: { type: Date },
  points: { type: Number, default: 0 },
  requestedPoints: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['REGISTRADO', 'ENVIADO_CIARP', 'APROBADO', 'RECHAZADO', 'APLAZADO'], 
    default: 'REGISTRADO' 
  },
  actaId: { type: Schema.Types.ObjectId, ref: 'Acta' },
  evaluationReason: { type: String },
  fileUrl: { type: String },
  totalAuthors: { type: Number },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

if (mongoose.models.AcademicItem) {
  delete mongoose.models.AcademicItem;
}

export default mongoose.model<IAcademicItem>('AcademicItem', AcademicItemSchema);
