
import mongoose from 'mongoose';

const MONGODB_URI="mongodb://ticsoft:Ticsoft.123@127.0.0.1:27017/DB_SIGAIUniSucre?directConnection=true&authMechanism=SCRAM-SHA-256&authSource=admin"

async function test() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'docente@unisucre.edu.co' });
  console.log('USER FROM DB:', JSON.stringify(user, null, 2));
  process.exit(0);
}

test();
