import { getSession } from "@/lib/actions/auth-actions"
import { redirect } from "next/navigation"
import { getAllWorkPlans } from "@/lib/actions/plan-actions"
import ReviewWorkPlansClient from "./ReviewWorkPlansClient"

export default async function ReviewWorkPlansPage() {
  const session = await getSession()
  if (!session || !['vicerrectoria', 'ADMIN', 'ADMINDIUS'].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const plansRes = await getAllWorkPlans()
  const plans = plansRes.success ? plansRes.data : []

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ReviewWorkPlansClient initialPlans={plans} user={session.user} />
    </div>
  )
}
