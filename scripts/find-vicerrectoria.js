import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb://ticsoft:Ticsoft.123@127.0.0.1:27017/DB_SIGAIUniSucre?directConnection=true&authMechanism=SCRAM-SHA-256&authSource=admin";

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  identification: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['DOCENTE', 'ADMIN', 'ADMINDIUS', 'ADMINGESTION', 'ADMINCIARP', 'ADMINVICE', 'vicerrectoria'],
    default: 'DOCENTE' 
  },
  profile: { type: Object, default: {} }
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  
  // Find a user with role 'vicerrectoria'
  let viceUser = await User.findOne({ role: 'vicerrectoria' });
  if (!viceUser) {
    console.log("No vicerrectoria user found. Creating one...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    viceUser = await User.create({
      fullName: "Vicerrectoria Academica Test",
      identification: "9999",
      email: "vicerrectoria@unisucre.edu.co",
      password: hashedPassword,
      role: "vicerrectoria",
      profile: {}
    });
    console.log("Created vicerrectoria user:", viceUser.email);
  } else {
    console.log("Found existing vicerrectoria user:", viceUser.email);
  }
  
  // Also check ADMINGESTION user (immediate boss role)
  let bossUser = await User.findOne({ role: 'ADMINGESTION' });
  if (!bossUser) {
    console.log("No ADMINGESTION user found. Creating one...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    bossUser = await User.create({
      fullName: "Jefe de Departamento Test",
      identification: "8888",
      email: "jefe@unisucre.edu.co",
      password: hashedPassword,
      role: "ADMINGESTION",
      profile: {}
    });
    console.log("Created ADMINGESTION user:", bossUser.email);
  } else {
    console.log("Found existing ADMINGESTION user:", bossUser.email);
  }

  process.exit(0);
}

run();
