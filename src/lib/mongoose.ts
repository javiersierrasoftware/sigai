import mongoose from 'mongoose';

// Pre-register all models to prevent "Schema hasn't been registered" populate errors in Next.js development/production
import '@/lib/models/Faculty';
import '@/lib/models/AcademicProgram';
import '@/lib/models/ResearchLine';
import '@/lib/models/ResearchGroup';
import '@/lib/models/User';
import '@/lib/models/AcademicItem';
import '@/lib/models/Acta';
import '@/lib/models/Journal';
import '@/lib/models/Project';
import '@/lib/models/ProjectCall';
import '@/lib/models/ProjectEvaluation';
import '@/lib/models/AcademicPeriod';
import '@/lib/models/AcademicActivity';
import '@/lib/models/Rubric';
import '@/lib/models/WorkPlan';
import '@/lib/models/ProjectAct';
import '@/lib/models/Keyword';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
