import { getSession } from "@/lib/actions/auth-actions"
import { redirect } from "next/navigation"
import connectDB from "@/lib/mongoose"
import AcademicPortalClient from "./AcademicPortalClient"
import { getAcademicActivities } from "@/lib/actions/academic-activity-actions"

export default async function AcademicPortalPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'vicerrectoria') redirect('/dashboard');

  const res = await getAcademicActivities();
  const activities = res.success ? res.data : [];

  return (
    <AcademicPortalClient 
      initialActivities={activities}
      user={session.user}
    />
  );
}
