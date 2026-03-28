import { getOpenProjectCalls } from "@/lib/actions/project-actions";
import ProjectCallsListClient from "./ProjectCallsListClient";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function ConvocatoriasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: calls } = await getOpenProjectCalls();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader 
        user={session.user} 
        breadcrumbs={[{ label: 'Convocatorias Abiertas', active: true }]} 
      />
      <div className="py-4">
        <ProjectCallsListClient initialCalls={calls || []} />
      </div>
    </div>
  );
}
