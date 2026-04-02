'use server'

import connectDB from '@/lib/mongoose';
import AcademicItem from '@/lib/models/AcademicItem';
import User from '@/lib/models/User';
import Journal from '@/lib/models/Journal';
import { getSession } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function getAcademicHistory() {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');
    
    await connectDB();
    // Return items where the current user is in the 'users' array
    const items = await AcademicItem.find({ users: session.user.id }).sort({ date: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(items)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function searchInternalAuthors(query: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');
    await connectDB();
    const users = await User.find({ 
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).select('fullName email _id');
    return { success: true, data: JSON.parse(JSON.stringify(users)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function lookupJournalByIssn(issn: string) {
  try {
    await connectDB();
    const journal = await Journal.findOne({
      $or: [
        { issn1: issn },
        { issn2: issn }
      ]
    });
    return { success: true, data: JSON.parse(JSON.stringify(journal)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createAcademicItem(data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    
    // Extract internal user IDs from the authors list for the 'users' reference field
    const internalUserIds = data.authors
      .filter((a: any) => a.type === 'INTERNAL' && a.userId)
      .map((a: any) => a.userId);
    
    // Always include current user in the shared list if not already there
    if (!internalUserIds.includes(session.user.id)) {
      internalUserIds.push(session.user.id);
    }

    const newItem = await AcademicItem.create({
      users: internalUserIds,
      authors: data.authors,
      type: data.type,
      subtype: data.subtype,
      title: data.title,
      institution: data.institution || undefined,
      date: new Date(data.date),
      radicationDate: data.radicationDate ? new Date(data.radicationDate) : undefined,
      totalAuthors: data.totalAuthors || 1,
      researchLine: data.researchLine || undefined,
      keywords: data.keywords || [],
      fileUrl: data.fileUrl || undefined,
      metadata: data.metadata || {},
      status: 'REGISTRADO'
    });

    revalidatePath('/dashboard/academic-history');
    return { success: true, data: JSON.parse(JSON.stringify(newItem)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getResearchLines() {
  try {
    await connectDB();
    const ResearchLine = (await import('@/lib/models/ResearchLine')).default;
    const lines = await ResearchLine.find().sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(lines)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendToCiarp(itemId: string, data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    const item = await AcademicItem.findOneAndUpdate(
      { _id: itemId, users: session.user.id },
      { 
        status: 'ENVIADO_CIARP',
        requestedPoints: data.pointProjection || 0,
        points: data.pointProjection || 0,
        'metadata.submissionData': data,
        'metadata.sentAt': new Date().toISOString()
      },
      { new: true }
    );

    revalidatePath('/dashboard/academic-history');
    return { success: true, data: JSON.parse(JSON.stringify(item)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAcademicItem(id: string, data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    
    // Recalculate internal users
    const internalUserIds = data.authors
      .filter((a: any) => a.type === 'INTERNAL' && a.userId)
      .map((a: any) => a.userId);
    
    if (!internalUserIds.includes(session.user.id)) {
      internalUserIds.push(session.user.id);
    }

    const updated = await AcademicItem.findOneAndUpdate(
      { _id: id, users: session.user.id },
      {
        ...data,
        users: internalUserIds,
        date: new Date(data.date),
        researchLine: data.researchLine || undefined,
        keywords: data.keywords || []
      },
      { new: true }
    );

    revalidatePath('/dashboard/academic-history');
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
