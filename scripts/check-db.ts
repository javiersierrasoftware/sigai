
import mongoose from 'mongoose';
import connectDB from './src/lib/mongoose';
import User from './src/lib/models/User';

async function test() {
  await connectDB();
  const user = await User.findOne({ email: 'docente@unisucre.edu.co' });
  console.log('USER FROM DB:', JSON.stringify(user, null, 2));
  process.exit(0);
}

test();
