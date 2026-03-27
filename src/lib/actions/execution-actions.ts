'use server'

import connectDB from '@/lib/mongoose';
import Project from '@/lib/models/Project';
import ProjectAct from '@/lib/models/ProjectAct';
import { getSession } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function getProjectForExecution(id: string) {
  try {
    await connectDB();
    const project = await Project.findById(id).lean();
    if (!project) throw new Error('Proyecto no encontrado');

    const acts = await ProjectAct.find({ projectId: id }).sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: {
        project: JSON.parse(JSON.stringify(project)),
        acts: JSON.parse(JSON.stringify(acts))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitProjectAct(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    
    const projectId = formData.get('projectId') as string;
    const type = formData.get('type') as string;
    const summary = formData.get('summary') as string;
    const achievements = formData.get('achievements') as string;
    const progressPercentage = parseInt(formData.get('progressPercentage') as string || '0');
    const attachments = JSON.parse(formData.get('attachments') as string || '[]');

    const newAct = await ProjectAct.create({
      projectId,
      type,
      summary,
      achievements,
      progressPercentage,
      attachments,
      status: 'SUBMITTED',
      date: new Date()
    });

    // If it's a Start Act (INICIO), we can potentially move project status or just track it
    // For now, we'll keep the project as APPROVED but with an active start act.

    revalidatePath(`/dashboard/projects/${projectId}/manage`);
    return { success: true, data: JSON.parse(JSON.stringify(newAct)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
