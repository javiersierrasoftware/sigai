'use server'

import connectDB from '@/lib/mongoose';
import Project, { IProject } from '@/lib/models/Project';
import { revalidatePath } from 'next/cache';
import { getSession } from './auth-actions';

/**
 * Gets all projects from MongoDB.
 */
export async function getProjects() {
  try {
    await connectDB();
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return {
      success: true,
      data: JSON.parse(JSON.stringify(projects)) as IProject[]
    };
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return {
      success: false,
      error: 'Hubo un error al cargar los proyectos.'
    };
  }
}

/**
 * Update project status (Admin only).
 */
export async function updateProjectStatus(projectId: string, status: string) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ADMINDIUS')) {
       throw new Error('No autorizado');
    }

    await connectDB();
    const updated = await Project.findByIdAndUpdate(projectId, { status }, { new: true });
    
    revalidatePath('/dashboard/admin/projects');
    revalidatePath('/dashboard/projects');
    
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Creates a new project in MongoDB.
 */
export async function createProject(formData: Partial<IProject>) {
  try {
    await connectDB();
    
    const newProject = await Project.create({
      ...formData,
      status: 'SUBMITTED', // Initial status when submitted
    });

    revalidatePath('/'); // Revalidate the home dashboard
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(newProject)) as IProject
    };
  } catch (error: any) {
    console.error('Error creating project:', error);
    return {
      success: false,
      error: 'No se pudo crear el proyecto.'
    };
  }
}
/**
 * Gets active project calls for researchers.
 */
export async function getOpenProjectCalls() {
  try {
    await connectDB();
    const ProjectCall = (await import('@/lib/models/ProjectCall')).default;
    const calls = await ProjectCall.find({ status: 'ABIERTA' }).sort({ closingDate: 1 });
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(calls))
    };
  } catch (error: any) {
    return { success: false, error: 'Error al cargar convocatorias.' };
  }
}

/**
 * Gets a specific project call by ID.
 */
export async function getProjectCallById(id: string) {
  try {
    await connectDB();
    const ProjectCall = (await import('@/lib/models/ProjectCall')).default;
    const call = await ProjectCall.findById(id).lean();
    if (!call) return { success: false, error: 'Call not found' };
    return { success: true, data: JSON.parse(JSON.stringify(call)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProjectById(id: string) {
  try {
    await connectDB();
    const project = await Project.findById(id).lean();
    if (!project) return { success: false, error: 'Proyecto no encontrado' };
    return { success: true, data: JSON.parse(JSON.stringify(project)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Gets projects for a specific user.
 */
export async function getProjectsByUser(userEmail?: string) {
  try {
    const { getSession } = await import('./auth-actions');
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    const projects = await Project.find({
      $or: [
        { leaderEmail: userEmail || session.user.email },
        { leaderEmail: session.user.email } 
      ]
    }).sort({ createdAt: -1 });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(projects))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
