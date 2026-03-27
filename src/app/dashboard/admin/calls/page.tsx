import { getProjectCalls, getRubrics } from "@/lib/actions/admin-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import CallManagementClient from "./CallManagementClient";

export default async function ProjectCallsPage() {
  const session = await getSession();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ADMINDIUS')) {
    redirect('/dashboard');
  }

  const callsResult = await getProjectCalls();
  const rubricsResult = await getRubrics();

  const initialCalls = callsResult.success ? callsResult.data : [];
  const allRubrics = rubricsResult.success ? rubricsResult.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <CallManagementClient 
        initialCalls={initialCalls} 
        allRubrics={allRubrics} 
      />
    </div>
  );
}
