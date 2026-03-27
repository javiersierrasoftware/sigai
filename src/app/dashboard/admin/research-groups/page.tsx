import { getResearchGroups, getAllPrograms } from "@/lib/actions/admin-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import ResearchGroupManagementClient from "./ResearchGroupManagementClient";

export default async function AdminResearchGroupsPage() {
  const session = await getSession();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ADMINDIUS')) {
    redirect('/dashboard');
  }

  const groupsResult = await getResearchGroups();
  const programsResult = await getAllPrograms();

  const groups = groupsResult.success ? groupsResult.data : [];
  const allPrograms = programsResult.success ? programsResult.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <ResearchGroupManagementClient 
        initialGroups={groups} 
        allPrograms={allPrograms} 
      />
    </div>
  );
}
