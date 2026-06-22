'use server'

import connectDB from "@/lib/mongoose";
import WorkPlan from "@/lib/models/WorkPlan";
import { revalidatePath } from "next/cache";

export async function saveWorkPlan(data: any) {
  try {
    await connectDB();
    
    // Clean empty IDs to avoid BSON error
    const facultyId = data.facultyId === "" ? null : data.facultyId;
    const programId = data.programId === "" ? null : data.programId;

    // Ensure multiplierFactor is always a valid number in activities
    const cleanedActivities = (data.activities || []).map((act: any) => ({
      type: act.type,
      name: act.name,
      weeklyHours: Number(act.weeklyHours) || 0,
      multiplierFactor: Number(act.multiplierFactor) || 1.0,
      semesterHours: Number(act.semesterHours) || 0,
      description: act.description || ''
    }));

    // Use $set to explicitly update all fields including nested arrays
    const plan = await WorkPlan.findOneAndUpdate(
      { user: data.user, semester: data.semester },
      {
        $set: {
          facultyId,
          programId,
          personalInfo: data.personalInfo,
          activities: cleanedActivities,
          exclusivity: data.exclusivity || 'NO',
          status: data.status || 'DRAFT'
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate({
      path: 'user',
      select: 'fullName identification profile',
      populate: [
        { path: 'profile.faculty', select: 'name' },
        { path: 'profile.program', select: 'name' }
      ]
    });

    console.log(`✅ Plan saved for user: ${plan.user?.fullName}, activities: ${cleanedActivities.length}`);
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(plan)) };
  } catch (error: any) {
    console.error("Error saving work plan:", error);
    return { success: false, error: error.message };
  }
}

export async function getWorkPlansByUser(userId: string) {
  try {
    await connectDB();
    const plans = await WorkPlan.find({ user: userId }).sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(plans)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWorkPlanBySemester(userId: string, semester: string) {
  try {
    await connectDB();
    const plan = await WorkPlan.findOne({ user: userId, semester });
    return { success: true, data: JSON.parse(JSON.stringify(plan)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWorkPlanStatus(planId: string, status: string, comment?: string, evaluatorId?: string) {
  try {
    await connectDB();
    const plan = await WorkPlan.findByIdAndUpdate(planId, {
      status,
      evaluatorComment: comment,
      evaluatedBy: evaluatorId,
      evaluatedAt: new Date()
    }, { new: true });
    revalidatePath('/dashboard');
    return { success: true, data: JSON.parse(JSON.stringify(plan)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
import AcademicPeriod from "@/lib/models/AcademicPeriod";

export async function getCurrentWorkPlan(userId: string) {
  try {
    await connectDB();
    const currentPeriod = await AcademicPeriod.findOne({ isCurrent: true });
    if (!currentPeriod) return { success: false, error: "No hay periodo actual configurado" };

    const plan = await WorkPlan.findOne({ user: userId, semester: currentPeriod.name });
    return { success: true, data: JSON.parse(JSON.stringify(plan)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

import User from "@/lib/models/User";
import Faculty from "@/lib/models/Faculty";
import AcademicProgram from "@/lib/models/AcademicProgram";

export async function getAllWorkPlans() {
  try {
    await connectDB();
    const plans = await WorkPlan.find()
      .populate({
        path: 'user',
        select: 'fullName identification profile',
        populate: [
          { path: 'profile.faculty', select: 'name' },
          { path: 'profile.program', select: 'name' }
        ]
      });
    console.log(`📦 DB: Found ${plans.length} work plans total`);
    return { success: true, data: JSON.parse(JSON.stringify(plans)) };
  } catch (error: any) {
    console.error("Error in getAllWorkPlans:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Save evidence (text + file URLs) for a specific activity within a plan.
 * Uses the activity index to target the correct subdocument.
 */
export async function saveActivityEvidence(
  planId: string,
  activityIndex: number,
  evidenceText: string,
  evidenceFiles: string[]
) {
  try {
    await connectDB();

    const plan = await WorkPlan.findByIdAndUpdate(
      planId,
      {
        $set: {
          [`activities.${activityIndex}.evidenceText`]: evidenceText,
          [`activities.${activityIndex}.evidenceFiles`]: evidenceFiles,
        }
      },
      { new: true }
    );

    if (!plan) return { success: false, error: 'Plan no encontrado' };

    revalidatePath('/dashboard/plan-trabajo');
    return { success: true, data: JSON.parse(JSON.stringify(plan)) };
  } catch (error: any) {
    console.error('Error saving evidence:', error);
    return { success: false, error: error.message };
  }
}
