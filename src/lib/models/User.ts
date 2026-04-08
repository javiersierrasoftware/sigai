import mongoose, { Schema, model, models, Document } from 'mongoose';

export type UserRole = 'DOCENTE' | 'ADMIN' | 'ADMINDIUS' | 'ADMINGESTION' | 'ADMINCIARP' | 'ADMINVICE' | 'vicerrectoria';

export interface IUser extends Document {
  fullName: string;
  identification: string;
  email: string;
  password: string;
  role: UserRole;
  profile?: {
    faculty?: mongoose.Types.ObjectId;
    program?: mongoose.Types.ObjectId;
    joiningMonth?: string;
    joiningYear?: string;
    contractType?: string;
    ods?: string[];
    researchLines?: mongoose.Types.ObjectId[];
    mincienciasCategory?: string;
    cvlacUrl?: string;
    researchAreas?: string[];
    biography?: string;
    orcidId?: string;
    orcidUrl?: string;
    googleScholarUrl?: string;
    profilePicture?: string;
    birthDate?: string;
    gender?: string;
    differentialFocus?: string;
    hasDisability?: boolean;
    disabilityType?: string;
    researchGroups?: mongoose.Types.ObjectId[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema({
  faculty: { type: Schema.Types.ObjectId, ref: 'Faculty' },
  program: { type: Schema.Types.ObjectId, ref: 'AcademicProgram' },
  joiningMonth: { type: String },
  joiningYear: { type: String },
  contractType: { type: String },
  ods: [{ type: String }],
  researchLines: [{ type: Schema.Types.ObjectId, ref: 'ResearchLine' }],
  mincienciasCategory: { type: String },
  cvlacUrl: { type: String },
  researchAreas: [{ type: String }],
  biography: { type: String },
  orcidId: { type: String },
  orcidUrl: { type: String },
  googleScholarUrl: { type: String },
  profilePicture: { type: String },
  birthDate: { type: String },
  gender: { type: String },
  differentialFocus: { type: String },
  hasDisability: { type: Boolean, default: false },
  disabilityType: { type: String },
  researchGroups: [{ type: Schema.Types.ObjectId, ref: 'ResearchGroup' }],
}, { _id: false });

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true },
  identification: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['DOCENTE', 'ADMIN', 'ADMINDIUS', 'ADMINGESTION', 'ADMINCIARP', 'ADMINVICE', 'vicerrectoria'],
    default: 'DOCENTE' 
  },
  profile: { type: ProfileSchema, default: {} }
}, {
  timestamps: true,
});

UserSchema.index({ role: 1 });
UserSchema.index({ "profile.faculty": 1 });

if (mongoose.models && mongoose.models.User) {
  delete (mongoose.models as any).User;
}
const User = model<IUser>('User', UserSchema);

export default User;
