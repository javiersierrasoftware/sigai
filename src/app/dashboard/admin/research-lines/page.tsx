import { getResearchLines } from "@/lib/actions/admin-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import ResearchLinesManagementClient from "./ResearchLinesManagementClient";

export default async function AdminResearchLinesPage() {
  const session = await getSession();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ADMINDIUS')) {
    redirect('/dashboard');
  }

  const result = await getResearchLines();
  const lines = result.success ? result.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ResearchLinesManagementClient initialLines={lines} />
    </div>
  );
}
