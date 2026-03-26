import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IActa extends Document {
  number: string;
  date: Date;
  agenda: string;
  status: 'OPEN' | 'CLOSED';
  sessionUrl?: string; // Optional link to the online session
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActaSchema = new Schema<IActa>({
  number: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  agenda: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['OPEN', 'CLOSED'], 
    default: 'OPEN' 
  },
  sessionUrl: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
});

const Acta = models.Acta || model<IActa>('Acta', ActaSchema);
export default Acta;
