'use server'

import connectDB from "@/lib/mongoose";
import AcademicActivity from "@/lib/models/AcademicActivity";
import { revalidatePath } from "next/cache";

export async function createAcademicActivity(data: any) {
  try {
    await connectDB();
    const newActivity = new AcademicActivity(data);
    await newActivity.save();
    revalidatePath('/dashboard/admin/academic-portal');
    return { success: true, data: JSON.parse(JSON.stringify(newActivity)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAcademicActivity(id: string, data: any) {
  try {
    await connectDB();
    const activity = await AcademicActivity.findByIdAndUpdate(id, data, { new: true });
    revalidatePath('/dashboard/admin/academic-portal');
    return { success: true, data: JSON.parse(JSON.stringify(activity)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAcademicActivities() {
  try {
    await connectDB();
    const activities = await AcademicActivity.find().sort({ type: 1, name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(activities)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAcademicActivity(id: string) {
  try {
    await connectDB();
    await AcademicActivity.findByIdAndDelete(id);
    revalidatePath('/dashboard/admin/academic-portal');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
