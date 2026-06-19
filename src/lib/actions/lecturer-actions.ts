'use server'

import connectDB from "@/lib/mongoose";
import User from "@/lib/models/User";
import bcrypt from 'bcryptjs';
import { revalidatePath } from "next/cache";

export async function getLecturers() {
  try {
    await connectDB();
    const lecturers = await User.find({ role: 'DOCENTE' }).sort({ fullName: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(lecturers)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createLecturer(data: { fullName: string, identification: string, contractType: string, email?: string }) {
  try {
    await connectDB();
    
    // Check if identification already exists
    const existingById = await User.findOne({ identification: data.identification });
    if (existingById) {
      return { success: false, error: 'La identificación ya está registrada.' };
    }

    // Check if email already exists (if provided)
    if (data.email && data.email.trim()) {
      const existingByEmail = await User.findOne({ email: data.email.toLowerCase().trim() });
      if (existingByEmail) {
        return { success: false, error: 'El correo ya está registrado.' };
      }
    }

    // Hash password with identification
    const hashedPassword = await bcrypt.hash(data.identification, 10);

    const newUser = await User.create({
      fullName: data.fullName,
      identification: data.identification,
      email: data.email && data.email.trim() ? data.email.toLowerCase().trim() : undefined,
      password: hashedPassword,
      role: 'DOCENTE',
      profile: {
        contractType: data.contractType
      }
    });

    revalidatePath('/dashboard/admin/lecturers');
    revalidatePath('/dashboard/ciarp-admin');
    return { success: true, data: JSON.parse(JSON.stringify(newUser)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLecturer(id: string, data: { fullName: string, identification: string, contractType: string, email?: string }) {
  try {
    await connectDB();

    // Check if identification already exists for another user
    const existingById = await User.findOne({ identification: data.identification, _id: { $ne: id } });
    if (existingById) {
      return { success: false, error: 'La identificación ya está en uso por otro docente.' };
    }

    // Check if email already exists for another user
    if (data.email && data.email.trim()) {
      const existingByEmail = await User.findOne({ email: data.email.toLowerCase().trim(), _id: { $ne: id } });
      if (existingByEmail) {
        return { success: false, error: 'El correo ya está en uso por otro docente.' };
      }
    }

    const updatePayload: any = {
      fullName: data.fullName,
      identification: data.identification,
      email: data.email && data.email.trim() ? data.email.toLowerCase().trim() : undefined,
    };

    const currentUser = await User.findById(id);
    if (currentUser && currentUser.identification !== data.identification) {
      updatePayload.password = await bcrypt.hash(data.identification, 10);
    }

    // Perform update
    const updatedUser = await User.findById(id);
    if (!updatedUser) throw new Error('Docente no encontrado');

    updatedUser.fullName = data.fullName;
    updatedUser.identification = data.identification;
    updatedUser.email = data.email && data.email.trim() ? data.email.toLowerCase().trim() : undefined;
    if (updatePayload.password) {
      updatedUser.password = updatePayload.password;
    }

    // Make sure we update contractType in profile
    if (!updatedUser.profile) {
      updatedUser.profile = { contractType: data.contractType };
    } else {
      updatedUser.profile.contractType = data.contractType;
    }
    // Mark modified for subdocument
    updatedUser.markModified('profile');
    await updatedUser.save();

    revalidatePath('/dashboard/admin/lecturers');
    revalidatePath('/dashboard/ciarp-admin');
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLecturer(id: string) {
  try {
    await connectDB();
    await User.findByIdAndDelete(id);
    revalidatePath('/dashboard/admin/lecturers');
    revalidatePath('/dashboard/ciarp-admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
