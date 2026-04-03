'use server'

import connectDB from "@/lib/mongoose";
import AcademicPeriod from "@/lib/models/AcademicPeriod";
import { revalidatePath } from "next/cache";

export async function createAcademicPeriod(data: any) {
  try {
    await connectDB();
    const newPeriod = new AcademicPeriod(data);
    await newPeriod.save();
    revalidatePath('/dashboard/admin/academic-portal'); // revalidate several paths
    return { success: true, data: JSON.parse(JSON.stringify(newPeriod)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAcademicPeriod(id: string, data: any) {
  try {
    await connectDB();
    
    // If setting as current, unset others
    if (data.isCurrent) {
        await AcademicPeriod.updateMany({ _id: { $ne: id } }, { isCurrent: false });
    }

    const period = await AcademicPeriod.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/dashboard/admin/academic-portal');
    return { success: true, data: JSON.parse(JSON.stringify(period)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAcademicPeriods() {
  try {
    await connectDB();
    const periods = await AcademicPeriod.find().sort({ name: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(periods)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAcademicPeriod(id: string) {
  try {
    await connectDB();
    await AcademicPeriod.findByIdAndDelete(id);
    revalidatePath('/dashboard/admin/academic-portal');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
