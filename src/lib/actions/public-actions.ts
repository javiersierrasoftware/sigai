'use server'

import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/mongoose';
import User from '@/lib/models/User';
import AcademicItem from '@/lib/models/AcademicItem';
import Project from '@/lib/models/Project';
import ResearchGroup from '@/lib/models/ResearchGroup';

// Cache the expensive queries for 1 hour (3600 seconds)
const getCachedStatsData = unstable_cache(
  async () => {
    await connectDB();

    const [
      totalResearchers,
      totalProjects,
      totalProducts,
      groups
    ] = await Promise.all([
      User.countDocuments({ role: 'DOCENTE' }),
      Project.countDocuments({ status: { $in: ['APPROVED', 'IN_EXECUTION'] } }),
      AcademicItem.countDocuments({ type: 'PRODUCCION' }),
      ResearchGroup.find().lean()
    ]);

    // Grouping groups by category
    const groupsByCategory = groups.reduce((acc: any, g: any) => {
      const cat = g.category || 'NC';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Top subtypes of production
    const topSubtypes = await AcademicItem.aggregate([
      { $match: { type: 'PRODUCCION' } },
      { $group: { _id: '$subtype', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Researchers per faculty
    const researchersByFaculty = await User.aggregate([
      { $match: { role: 'DOCENTE', 'profile.faculty': { $exists: true, $ne: null } } },
      { $group: { _id: '$profile.faculty', count: { $sum: 1 } } },
      { $lookup: { from: 'faculties', localField: '_id', foreignField: '_id', as: 'faculty' } },
      { $unwind: '$faculty' },
      { $project: { name: '$faculty.name', value: '$count' } },
      { $sort: { value: -1 } }
    ]);

    return {
      counters: {
        researchers: totalResearchers,
        projects: totalProjects,
        products: totalProducts,
        groups: groups.length
      },
      groupsByCategory,
      topSubtypes: topSubtypes.map(s => ({ name: s._id, value: s.count })),
      researchersByFaculty
    };
  },
  ['public-stats-key'],
  { revalidate: 3600 } // Revalidate every hour
);

export async function getPublicStats() {
  try {
    const data = await getCachedStatsData();
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching public stats:', error);
    return { success: false, error: error.message };
  }
}
