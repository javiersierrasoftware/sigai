import 'dotenv/config';
import connectDB from './src/lib/mongoose';
import ProjectCall from './src/lib/models/ProjectCall';

async function debug() {
  await connectDB();
  const calls = await ProjectCall.find({});
  console.log('TOTAL CALLS:', calls.length);
  calls.forEach(c => {
    console.log(`- ${c.title} [${c.status}] | Open: ${c.openingDate} | Close: ${c.closingDate} | Now: ${new Date()}`);
  });
  process.exit(0);
}

debug();
