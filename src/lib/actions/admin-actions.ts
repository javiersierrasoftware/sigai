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
