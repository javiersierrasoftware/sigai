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
    const item = await AcademicItem.findOne({ _id: itemId, users: session.user.id });
    if (!item) throw new Error('Documento no encontrado o sin permisos');

    // DECOUPLE IF SHARED
    if (item.users.length > 1) {
      await AcademicItem.updateOne({ _id: itemId }, { $pull: { users: session.user.id } });
      const newItemData = item.toObject();
      delete newItemData._id;
      delete newItemData.createdAt;
      delete newItemData.updatedAt;

      const cloned = await AcademicItem.create({
        ...newItemData,
        users: [session.user.id],
        status: 'ENVIADO_CIARP',
        requestedPoints: data.pointProjection || 0,
        points: data.pointProjection || 0,
        metadata: {
           ...(item.metadata || {}),
           submissionData: data,
           sentAt: new Date().toISOString()
        }
      });
      revalidatePath('/dashboard/academic-history');
      return { success: true, data: JSON.parse(JSON.stringify(cloned)) };
    }

    // Normal update if single owner
    item.status = 'ENVIADO_CIARP';
    item.requestedPoints = data.pointProjection || 0;
    item.points = data.pointProjection || 0;
    item.metadata = {
      ...(item.metadata || {}),
      submissionData: data,
      sentAt: new Date().toISOString()
    };
    await item.save();

    revalidatePath('/dashboard/academic-history');
    return { success: true, data: JSON.parse(JSON.stringify(item)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function processKeywords(rawKeywords: string[]) {
  if (!rawKeywords || rawKeywords.length === 0) return [];
  const Keyword = (await import('@/lib/models/Keyword')).default;
  const processed = [];

  for (let kw of rawKeywords) {
    const display = kw.trim();
    if (!display) continue;
    // Normalize: lowercase and remove accents/diacritics
    const normalized = display.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Upsert into Keyword tracking
    await Keyword.findOneAndUpdate(
      { normalized },
      { $setOnInsert: { display }, $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    processed.push(normalized);
  }
  
  return processed;
}

export async function searchKeywords(query: string) {
  try {
    await connectDB();
    const Keyword = (await import('@/lib/models/Keyword')).default;
    const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const keywords = await Keyword.find({ 
      normalized: { $regex: normalizedQuery, $options: 'i' } 
    }).sort({ count: -1 }).limit(10);
    return { success: true, data: JSON.parse(JSON.stringify(keywords)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function upsertJournalIfPresent(metadata: any) {
  if (!metadata || !metadata.issn || !metadata.journalName) return;
  const Journal = (await import('@/lib/models/Journal')).default;
  
  // Format ISSN strictly
  const issn = metadata.issn.replace(/[^a-zA-Z0-9-]/g, '');
  
  // Si no existe, lo creamos. Si existe, no sobreescribimos la categoría oficial
  // dejándolo para que el CIARP la asigne. Solo aseguramos que exista en BD.
  await Journal.findOneAndUpdate(
    { issn1: issn },
    { 
      $setOnInsert: { 
        name: metadata.journalName,
        category: metadata.journalCategory || 'NO_CATEGORIZADA'
      } 
    },
    { upsert: true }
  );
}

export async function createAcademicItem(data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    
    const internalUserIds = data.authors
      .filter((a: any) => a.type === 'INTERNAL' && a.userId)
      .map((a: any) => a.userId);
    
    if (!internalUserIds.includes(session.user.id)) {
      internalUserIds.push(session.user.id);
    }

    const processedKeywords = await processKeywords(data.keywords || []);
    await upsertJournalIfPresent(data.metadata);

    const itemsToCreate = internalUserIds.map((uid: string) => ({
      users: [uid],
      authors: data.authors,
      type: data.type,
      subtype: data.subtype,
      title: data.title,
      institution: data.institution || undefined,
      date: new Date(data.date),
      radicationDate: data.radicationDate ? new Date(data.radicationDate) : undefined,
      totalAuthors: data.totalAuthors || 1,
      researchLine: data.researchLine || undefined,
      keywords: processedKeywords,
      fileUrl: data.fileUrl || undefined,
      metadata: data.metadata || {},
      status: 'REGISTRADO'
    }));

    const newItems = await AcademicItem.insertMany(itemsToCreate);
    const currentUserItem = newItems.find((i: any) => i.users[0].toString() === session.user.id) || newItems[0];

    revalidatePath('/dashboard/academic-history');
    return { success: true, data: JSON.parse(JSON.stringify(currentUserItem)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAcademicItem(id: string, data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    
    const processedKeywords = await processKeywords(data.keywords || []);
    await upsertJournalIfPresent(data.metadata);

    const item = await AcademicItem.findOne({ _id: id, users: session.user.id });
    if (!item) throw new Error("Ítem no encontrado");

    let updatedItem;
    // DECOUPLE IF SHARED
    if (item.users.length > 1) {
       await AcademicItem.updateOne({ _id: id }, { $pull: { users: session.user.id } });
       
       const newItemData = item.toObject();
       delete newItemData._id;
       delete newItemData.createdAt;
       delete newItemData.updatedAt;

       updatedItem = await AcademicItem.create({
         ...newItemData,
         ...data,
         users: [session.user.id],
         date: new Date(data.date),
         researchLine: data.researchLine || undefined,
         keywords: processedKeywords
       });
    } else {
       updatedItem = await AcademicItem.findByIdAndUpdate(
         id,
         {
           ...data,
           users: [session.user.id],
           date: new Date(data.date),
           researchLine: data.researchLine || undefined,
           keywords: processedKeywords
         },
         { new: true }
       );
    }

    revalidatePath('/dashboard/academic-history');
    return { success: true, data: JSON.parse(JSON.stringify(updatedItem)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
