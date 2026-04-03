import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongoose";
import Faculty from "@/lib/models/Faculty";
import AcademicProgram from "@/lib/models/AcademicProgram";
import WorkPlanClient from "./WorkPlanClient";
import User from "@/lib/models/User";
import { getAcademicActivities } from "@/lib/actions/academic-activity-actions";
import { getAcademicPeriods } from "@/lib/actions/academic-period-actions";
import { getWorkPlansByUser } from "@/lib/actions/plan-actions";

export default async function WorkPlanPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const user = session.user;
  const faculties = await Faculty.find().sort({ name: 1 }).lean();
  const programs = await AcademicProgram.find().sort({ name: 1 }).lean();
  
  const resActivities = await getAcademicActivities();
  const catalog = resActivities.success ? resActivities.data : [];

  const resPeriods = await getAcademicPeriods();
  const periods = resPeriods.success ? resPeriods.data : [];

  const resPlans = await getWorkPlansByUser(user.id || user._id);
  const initialPlans = resPlans.success ? resPlans.data : [];

  return (
    <WorkPlanClient 
      user={JSON.parse(JSON.stringify(user))}
      faculties={JSON.parse(JSON.stringify(faculties))}
      programs={JSON.parse(JSON.stringify(programs))}
      catalog={JSON.parse(JSON.stringify(catalog))}
      periods={JSON.parse(JSON.stringify(periods))}
      initialPlans={JSON.parse(JSON.stringify(initialPlans))}
    />
  );
}
