import { getEvaluationsByEvaluator } from "@/lib/actions/evaluation-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import EvaluationsListClient from "./EvaluationsListClient";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function EvaluationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const res = await getEvaluationsByEvaluator(session.user.email);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader 
        user={session.user} 
        breadcrumbs={[{ label: 'Evaluar Proyectos', active: true }]} 
      />
      <div className="py-4">
        <EvaluationsListClient 
           evaluations={res.success ? res.data : []} 
        />
      </div>
    </div>
  );
}
