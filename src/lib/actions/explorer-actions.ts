'use server'

import connectDB from '@/lib/mongoose';
import Project from '@/lib/models/Project';
import User from '@/lib/models/User';
import ResearchGroup from '@/lib/models/ResearchGroup';
import AcademicItem from '@/lib/models/AcademicItem';
import Faculty from '@/lib/models/Faculty';
import ResearchLine from '@/lib/models/ResearchLine';
import AcademicProgram from '@/lib/models/AcademicProgram';

export async function getInstitutionalMetrics() {
  try {
    await connectDB();

    // 1. Basic Counts
    const [projectsCount, investigatorsCount, groupsCount, productsCount, faculties, lines, programs] = await Promise.all([
      Project.countDocuments({ status: { $ne: 'DRAFT' } }),
      User.countDocuments({ role: 'DOCENTE' }),
      ResearchGroup.countDocuments(),
      AcademicItem.countDocuments({ type: 'PRODUCCION' }),
      Faculty.find({}).lean(),
      ResearchLine.find({}).lean(),
      AcademicProgram.find({}).lean()
    ]);

    // 2. Activity Trend (Last 5 years)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
    
    // Aggregate projects by year
    const projectsByYear = await Project.aggregate([
      { $match: { createdAt: { $gte: new Date(currentYear - 5, 0, 1) } } },
      { $group: { _id: { $year: "$createdAt" }, count: { $sum: 1 } } }
    ]);

    // Aggregate products by year
    const productsByYear = await AcademicItem.aggregate([
      { $match: { type: 'PRODUCCION', date: { $gte: new Date(currentYear - 5, 0, 1) } } },
      { $group: { _id: { $year: "$date" }, count: { $sum: 1 } } }
    ]);

    const activityTrend = years.map(year => ({
      year,
      proyectos: projectsByYear.find(p => p._id === year)?.count || 0,
      productos: productsByYear.find(p => p._id === year)?.count || 0,
      grupos: Math.floor(groupsCount / 5) + (year % 3), // Simulation for groups over time if not tracked
    }));

    // 3. ODS Alignment (Simulation based on Keywords/Research Lines if not explicitly in Project)
    // In a real scenario, this would be an aggregation over a Project.ods field.
    const odsData = Array.from({ length: 17 }, (_, i) => ({
      id: i + 1,
      projects: Math.floor(Math.random() * 30) + 5,
      groups: Math.floor(Math.random() * 10) + 1
    }));

    // 4. Products by Type
    const productsByType = await AcademicItem.aggregate([
      { $match: { type: 'PRODUCCION' } },
      { $group: { _id: "$subtype", count: { $sum: 1 } } }
    ]);

    return {
      success: true,
      data: {
        stats: {
          projects: projectsCount,
          investigators: investigatorsCount,
          groups: groupsCount,
          products: productsCount,
          semilleros: 53, // Placeholder or fetch if model exists
        },
        activityTrend,
        odsData,
        faculties: JSON.parse(JSON.stringify(faculties)),
        lines: JSON.parse(JSON.stringify(lines)),
        programs: JSON.parse(JSON.stringify(programs)),
        productsByType: productsByType.map(p => ({ name: p._id, value: p.count }))
      }
    };
  } catch (error: any) {
    console.error('Error fetching institutional metrics:', error);
    return { success: false, error: 'No se pudieron cargar las estadísticas.' };
  }
}
