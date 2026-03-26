const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  identification: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['DOCENTE', 'ADMIN', 'ADMINDIUS', 'ADMINGESTION', 'ADMINCIARP', 'ADMINVICE'],
    default: 'DOCENTE' 
  },
  profile: { type: Object, default: {} }
}, {
  timestamps: true,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdminCiarp() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminData = {
      fullName: "ADMIN CIARP",
      identification: "002",
      email: "ciarp@unisucre.edu.co",
      password: "$2b$10$t4f5DMPHf/p5RKJ7V7VYPe9ZhFW9uKoFJyOn/84QLt5li.JgNDemO",
      role: "ADMIN_CIARP"
    };

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: adminData.email },
        { identification: adminData.identification }
      ]
    });

    if (existingUser) {
      console.log('User already exists. Updating role...');
      existingUser.role = 'ADMINCIARP';
      await existingUser.save();
      console.log('User role updated to ADMINCIARP');
    } else {
      const newUser = await User.create({
        ...adminData,
        role: 'ADMINCIARP' // Using the correct enum value from User.ts
      });
      console.log('New ADMINCIARP user created:', newUser.email);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error creating ADMINCIARP:', error);
    process.exit(1);
  }
}

createAdminCiarp();
