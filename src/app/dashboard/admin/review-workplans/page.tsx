import { getSession } from "@/lib/actions/auth-actions"
import { redirect } from "next/navigation"
import { getAllWorkPlans } from "@/lib/actions/plan-actions"
import ReviewWorkPlansClient from "./ReviewWorkPlansClient"
import User from "@/lib/models/User"

export default async function ReviewWorkPlansPage() {
  const session = await getSession()
  if (!session || !['vicerrectoria', 'ADMIN', 'ADMINDIUS', 'ADMINGESTION'].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const dbUser = await User.findById(session.user.id || session.user._id).lean();
  const user = dbUser ? {
    ...session.user,
    profile: dbUser.profile
  } : session.user;

  const plansRes = await getAllWorkPlans()
  const plans = plansRes.success ? plansRes.data : []

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ReviewWorkPlansClient initialPlans={plans} user={JSON.parse(JSON.stringify(user))} />
    </div>
  )
}
