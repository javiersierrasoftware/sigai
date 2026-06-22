import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://ticsoft:Ticsoft.123@127.0.0.1:27017/DB_SIGAIUniSucre?directConnection=true&authMechanism=SCRAM-SHA-256&authSource=admin";

async function test() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const plans = await db.collection('workplans').find({}).toArray();
  console.log('WORKPLANS FROM DB (raw):', JSON.stringify(plans, null, 2));
  process.exit(0);
}

test();
