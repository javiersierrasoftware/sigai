'use server'

import connectDB from '@/lib/mongoose';
import ProjectEvaluation from '@/lib/models/ProjectEvaluation';
import Project from '@/lib/models/Project';
import ProjectCall from '@/lib/models/ProjectCall';
import Rubric from '@/lib/models/Rubric';
import { getSession } from './auth-actions';
import { revalidatePath } from 'next/cache';

/**
 * Assign an evaluator to a project.
 */
export async function assignEvaluator(projectId: string, evaluatorData: { email: string, name: string }) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ADMINDIUS')) {
      throw new Error('No autorizado');
    }

    await connectDB();
    
    // Get the project to find the call and its rubric
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Proyecto no encontrado');

    const call = await ProjectCall.findById(project.projectCallId);
    if (!call || !call.rubricId) throw new Error('La convocatoria asociada no tiene una rúbrica configurada');

    // Check if evaluation already exists
    const existing = await ProjectEvaluation.findOne({ projectId, evaluatorEmail: evaluatorData.email });
    if (existing) throw new Error('Este evaluador ya está asignado a este proyecto');

    const evaluation = await ProjectEvaluation.create({
      projectId,
      evaluatorEmail: evaluatorData.email,
      evaluatorName: evaluatorData.name,
      rubricId: call.rubricId,
      status: 'PENDING'
    });

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, data: JSON.parse(JSON.stringify(evaluation)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Gets evaluations assigned to a specific evaluator (by email).
 */
export async function getEvaluationsByEvaluator(email: string) {
  try {
    await connectDB();
    const evaluations = await ProjectEvaluation.find({ evaluatorEmail: email })
      .populate('projectId', 'title status description principalInvestigator')
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(evaluations)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Gets all evaluations for a project (for Admin view).
 */
export async function getProjectEvaluations(projectId: string) {
  try {
    await connectDB();
    const evaluations = await ProjectEvaluation.find({ projectId }).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(evaluations)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Submits a completed evaluation.
 */
export async function submitEvaluation(evaluationId: string, criteriaScores: any[], comments: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    const evaluation = await ProjectEvaluation.findById(evaluationId);
    if (!evaluation) throw new Error('Evaluación no encontrada');
    if (evaluation.evaluatorEmail !== session.user.email) throw new Error('No autorizado');

    // Calculate score
    const totalScore = criteriaScores.reduce((acc, c) => acc + c.score, 0);

    evaluation.criteriaScores = criteriaScores;
    evaluation.comments = comments;
    evaluation.score = totalScore;
    evaluation.status = 'COMPLETED';
    evaluation.evaluatedAt = new Date();
    await evaluation.save();

    revalidatePath('/dashboard/evaluations');
    return { success: true, data: JSON.parse(JSON.stringify(evaluation)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
