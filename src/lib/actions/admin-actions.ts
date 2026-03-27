'use server'

import connectDB from '@/lib/mongoose';
import Faculty from '@/lib/models/Faculty';
import AcademicProgram from '@/lib/models/AcademicProgram';
import ResearchGroup from '@/lib/models/ResearchGroup';
import ResearchLine from '@/lib/models/ResearchLine';
import { getSession } from './auth-actions';
import { revalidatePath } from 'next/cache';

// Helper to check for ADMIN status
async function checkAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No autorizado. Se requieren permisos de Administrador.');
  }
  return session;
}

// FACULTIES
export async function createFaculty(formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const description = formData.get('description') as string;

    const faculty = await Faculty.create({ name, code, description });
    
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(faculty)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFaculties() {
  try {
    await connectDB();
    const faculties = await Faculty.find({}).sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(faculties)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ACADEMIC PROGRAMS
export async function createAcademicProgram(formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const facultyId = formData.get('facultyId') as string;
    const level = formData.get('level') as string;

    const program = await AcademicProgram.create({ 
      name, 
      code, 
      faculty: facultyId,
      level 
    });
    
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(program)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAcademicProgram(programId: string, formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    
    const name = formData.get('name') as string;
    const code = formData.get('code') as string;
    const level = formData.get('level') as string;

    const program = await AcademicProgram.findByIdAndUpdate(programId, { 
      name, 
      code, 
      level 
    }, { new: true });
    
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(program)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAcademicProgram(programId: string) {
  try {
    await checkAdmin();
    await connectDB();
    await AcademicProgram.findByIdAndDelete(programId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProgramsByFaculty(facultyId: string) {
  try {
    await connectDB();
    const programs = await AcademicProgram.find({ faculty: facultyId }).sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(programs)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllPrograms() {
  try {
    await connectDB();
    const programs = await AcademicProgram.find({}).sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(programs)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// RESEARCH GROUPS
export async function createResearchGroup(formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    
    const name = formData.get('name') as string;
    const category = formData.get('category') as any;
    const leaderName = formData.get('leaderName') as string;
    const leaderEmail = formData.get('leaderEmail') as string;
    const leaderPhone = formData.get('leaderPhone') as string;
    const gruplacUrl = formData.get('gruplacUrl') as string;
    
    // Parse multiple program IDs from hidden field or naming convention
    const academicProgramsStr = formData.get('academicPrograms') as string;
    const academicPrograms = academicProgramsStr ? JSON.parse(academicProgramsStr) : [];

    const group = await ResearchGroup.create({ 
      name, 
      category, 
      leaderName,
      leaderEmail,
      leaderPhone,
      gruplacUrl,
      academicPrograms
    });
    
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(group)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getResearchGroups() {
  try {
    await connectDB();
    const groups = await ResearchGroup.find({}).populate('academicPrograms').sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(groups)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateResearchGroup(groupId: string, formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    
    const name = formData.get('name') as string;
    const category = formData.get('category') as any;
    const leaderName = formData.get('leaderName') as string;
    const leaderEmail = formData.get('leaderEmail') as string;
    const leaderPhone = formData.get('leaderPhone') as string;
    const gruplacUrl = formData.get('gruplacUrl') as string;
    const academicProgramsStr = formData.get('academicPrograms') as string;
    const academicPrograms = academicProgramsStr ? JSON.parse(academicProgramsStr) : [];

    const group = await ResearchGroup.findByIdAndUpdate(groupId, { 
      name, 
      category, 
      leaderName,
      leaderEmail,
      leaderPhone,
      gruplacUrl,
      academicPrograms
    }, { new: true });
    
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(group)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteResearchGroup(groupId: string) {
  try {
    await checkAdmin();
    await connectDB();
    await ResearchGroup.findByIdAndDelete(groupId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// RESEARCH LINES
export async function createResearchLine(formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    const line = await ResearchLine.create({ name, description });
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(line)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getResearchLines() {
  try {
    await connectDB();
    const lines = await ResearchLine.find({}).sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(lines)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateResearchLine(lineId: string, formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    const line = await ResearchLine.findByIdAndUpdate(lineId, { name, description }, { new: true });
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(line)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// RESEARCH LINES
export async function deleteResearchLine(lineId: string) {
  try {
    await checkAdmin();
    await connectDB();
    await ResearchLine.findByIdAndDelete(lineId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// RUBRICS
export async function createRubric(formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const criteriaStr = formData.get('criteria') as string;
    const criteria = criteriaStr ? JSON.parse(criteriaStr) : [];

    const Rubric = (await import('@/lib/models/Rubric')).default;
    const rubric = await Rubric.create({ name, description, criteria });
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(rubric)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRubrics() {
  try {
    await connectDB();
    const Rubric = (await import('@/lib/models/Rubric')).default;
    const rubrics = await Rubric.find({}).sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(rubrics)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRubric(rubricId: string, formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const criteriaStr = formData.get('criteria') as string;
    const criteria = criteriaStr ? JSON.parse(criteriaStr) : [];

    const Rubric = (await import('@/lib/models/Rubric')).default;
    const rubric = await Rubric.findByIdAndUpdate(rubricId, { 
      name, description, criteria 
    }, { new: true });
    
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(rubric)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRubric(rubricId: string) {
  try {
    await checkAdmin();
    await connectDB();
    const Rubric = (await import('@/lib/models/Rubric')).default;
    await Rubric.findByIdAndDelete(rubricId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// PROJECT CALLS (CONVOCATORIAS)
export async function createProjectCall(formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    
    const title = formData.get('title') as string;
    const code = formData.get('code') as string;
    const yearInput = formData.get('year') as string;
    const year = yearInput && !isNaN(parseInt(yearInput)) ? parseInt(yearInput) : new Date().getFullYear();
    
    const budgetPerProject = parseFloat(formData.get('budgetPerProject') as string) || 0;
    const targetAudience = formData.get('targetAudience') as string;
    const description = formData.get('description') as string;
    const rubricId = formData.get('rubricId') || undefined;
    
    // Robust date parsing
    const openingRaw = formData.get('openingDate') as string;
    const closingRaw = formData.get('closingDate') as string;
    const openingDate = openingRaw ? new Date(openingRaw) : new Date();
    const closingDate = closingRaw ? new Date(closingRaw) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Validate dates
    if (isNaN(openingDate.getTime()) || isNaN(closingDate.getTime())) {
      throw new Error("Fechas de apertura o cierre inválidas.");
    }

    const requiredFieldsStr = formData.get('requiredFields') as string;
    const requiredFields = requiredFieldsStr ? JSON.parse(requiredFieldsStr) : [];
    
    const fieldConfigStr = formData.get('fieldConfig') as string;
    const fieldConfig = fieldConfigStr ? JSON.parse(fieldConfigStr) : {};

    const ProjectCall = (await import('@/lib/models/ProjectCall')).default;
    const call = await ProjectCall.create({
      title, code, year, budgetPerProject, targetAudience, description,
      rubricId, openingDate, closingDate, requiredFields, fieldConfig
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/convocatorias');
    return { success: true, data: JSON.parse(JSON.stringify(call)) };
  } catch (error: any) {
    console.error('Create Call Error:', error);
    return { success: false, error: `Error al crear: ${error.message}` };
  }
}

export async function updateProjectCall(id: string, formData: FormData) {
  try {
    await checkAdmin();
    await connectDB();
    
    const openingRaw = formData.get('openingDate') as string;
    const closingRaw = formData.get('closingDate') as string;
    const openingDate = openingRaw ? new Date(openingRaw) : undefined;
    const closingDate = closingRaw ? new Date(closingRaw) : undefined;

    const requiredFieldsStr = formData.get('requiredFields') as string;
    const fieldConfigStr = formData.get('fieldConfig') as string;

    const updateData: any = {
      title: formData.get('title'),
      code: formData.get('code'),
      year: parseInt(formData.get('year') as string) || undefined,
      budgetPerProject: parseFloat(formData.get('budgetPerProject') as string) || undefined,
      targetAudience: formData.get('targetAudience'),
      description: formData.get('description'),
      rubricId: formData.get('rubricId') || undefined,
    };

    if (openingDate && !isNaN(openingDate.getTime())) updateData.openingDate = openingDate;
    if (closingDate && !isNaN(closingDate.getTime())) updateData.closingDate = closingDate;
    if (requiredFieldsStr) updateData.requiredFields = JSON.parse(requiredFieldsStr);
    if (fieldConfigStr) updateData.fieldConfig = JSON.parse(fieldConfigStr);

    const ProjectCall = (await import('@/lib/models/ProjectCall')).default;
    const call = await ProjectCall.findByIdAndUpdate(id, updateData, { new: true });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/convocatorias');
    return { success: true, data: JSON.parse(JSON.stringify(call)) };
  } catch (error: any) {
    console.error('Update Call Error:', error);
    return { success: false, error: `Error al actualizar: ${error.message}` };
  }
}

export async function deleteProjectCall(id: string) {
  try {
    await checkAdmin();
    await connectDB();
    const ProjectCall = (await import('@/lib/models/ProjectCall')).default;
    await ProjectCall.findByIdAndDelete(id);
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/convocatorias');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getProjectCalls() {
  try {
    await connectDB();
    const ProjectCall = (await import('@/lib/models/ProjectCall')).default;
    const calls = await ProjectCall.find({}).populate('rubricId').sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(calls)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
