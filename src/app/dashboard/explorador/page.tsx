import { getInstitutionalMetrics } from "@/lib/actions/explorer-actions";
import InstitutionalExplorerClient from "./InstitutionalExplorerClient";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function ExplorerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const metricsRes = await getInstitutionalMetrics();

  if (!metricsRes.success || !metricsRes.data) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-serif text-slate-800">Error al cargar el explorador</h1>
        <p className="text-slate-500 mt-2">{metricsRes.error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader 
        user={session.user} 
        breadcrumbs={[{ label: 'Explorador SIGAI', active: true }]} 
      />
      <div className="py-4">
        <InstitutionalExplorerClient 
          initialData={metricsRes.data} 
        />
      </div>
    </div>
  );
}
