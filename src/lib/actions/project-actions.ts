'use server'

import connectDB from '@/lib/mongoose';
import Project, { IProject } from '@/lib/models/Project';
import { revalidatePath } from 'next/cache';

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
 * Creates a new project in MongoDB.
 */
export async function createProject(formData: Partial<IProject>) {
  try {
    await connectDB();
    
    const newProject = await Project.create({
      ...formData,
      status: 'review', // Initial status
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
