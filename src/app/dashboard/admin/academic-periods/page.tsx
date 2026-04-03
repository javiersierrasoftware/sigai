import { getSession } from "@/lib/actions/auth-actions"
import { redirect } from "next/navigation"
import connectDB from "@/lib/mongoose"
import AcademicPeriodsClient from "./AcademicPeriodsClient"
import { getAcademicPeriods } from "@/lib/actions/academic-period-actions"

export default async function AcademicPeriodsPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'vicerrectoria') redirect('/dashboard');

  const res = await getAcademicPeriods();
  const periods = res.success ? res.data : [];

  return (
    <AcademicPeriodsClient 
      initialPeriods={periods}
      user={session.user}
    />
  );
}
