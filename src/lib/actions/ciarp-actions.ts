'use server'

import connectDB from '@/lib/mongoose';
import AcademicItem from '@/lib/models/AcademicItem';
import Acta from '@/lib/models/Acta';
import User from '@/lib/models/User';
import { getSession } from './auth-actions';
import { revalidatePath } from 'next/cache';

/**
 * CIARP ADMIN ACTIONS
 */

export async function getCiarpDashboardData() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMINCIARP') throw new Error('No autorizado');

    await connectDB();
    
    // Get pending submissions
    const pendingSubmissions = await AcademicItem.find({ status: 'ENVIADO_CIARP' })
      .populate({ path: 'users', select: 'fullName email identification' })
      .sort({ createdAt: 1 })
      .lean();

    // Get addressed submissions (Already evaluated)
    const addressedSubmissions = await AcademicItem.find({ 
      status: { $in: ['APROBADO', 'RECHAZADO', 'APLAZADO'] } 
    })
      .populate('users', 'fullName email identification profile')
      .populate('actaId', 'number')
      .sort({ updatedAt: -1 })
      .lean();

    // Get all lecturers
    const lecturers = await User.find({ role: 'DOCENTE' })
      .select('fullName email identification profile')
      .sort({ fullName: 1 })
      .lean();

    // Get all Actas
    const actas = await Acta.find({}).sort({ date: -1 }).lean();

    return { 
      success: true, 
      data: {
        pendingSubmissions: JSON.parse(JSON.stringify(pendingSubmissions)),
        addressedSubmissions: JSON.parse(JSON.stringify(addressedSubmissions)),
        lecturers: JSON.parse(JSON.stringify(lecturers)),
        actas: JSON.parse(JSON.stringify(actas))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createActa(data: { number: string, date: string, agenda: string }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMINCIARP') throw new Error('No autorizado');

    await connectDB();
    const newActa = await Acta.create({
      ...data,
      date: new Date(data.date),
      createdBy: session.user.id,
      status: 'OPEN'
    });

    revalidatePath('/dashboard/ciarp-admin');
    return { success: true, data: JSON.parse(JSON.stringify(newActa)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function evaluateSubmission(submissionId: string, data: { status: string, reason?: string, actaId: string }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMINCIARP') throw new Error('No autorizado');

    await connectDB();
    const updated = await AcademicItem.findByIdAndUpdate(
      submissionId,
      {
        status: data.status,
        evaluationReason: data.reason,
        actaId: data.actaId,
      },
      { new: true }
    );

    revalidatePath('/dashboard/ciarp-admin');
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Bulk Evaluation Logic
 * Filters submissions by title/criteria and applies the same decision to all.
 */
export async function bulkEvaluateSubmissions(submissionIds: string[], data: { status: string, reason?: string, actaId: string }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMINCIARP') throw new Error('No autorizado');

    await connectDB();
    await AcademicItem.updateMany(
      { _id: { $in: submissionIds } },
      {
        status: data.status,
        evaluationReason: data.reason,
        actaId: data.actaId,
      }
    );

    revalidatePath('/dashboard/ciarp-admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function updateActa(actaId: string, data: { number?: string, date?: string, agenda?: string, status?: 'OPEN' | 'CLOSED' }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMINCIARP') throw new Error('No autorizado');

    await connectDB();
    const update: any = { ...data };
    if (data.date) update.date = new Date(data.date);

    const updated = await Acta.findByIdAndUpdate(actaId, update, { new: true });

    revalidatePath('/dashboard/ciarp-admin');
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
