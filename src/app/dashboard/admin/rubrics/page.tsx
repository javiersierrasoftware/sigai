import { getRubrics } from "@/lib/actions/admin-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import RubricManagementClient from "./RubricManagementClient";

export default async function RubricsPage() {
  const session = await getSession();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ADMINDIUS')) {
    redirect('/dashboard');
  }

  const rubricsResult = await getRubrics();
  const initialRubrics = rubricsResult.success ? rubricsResult.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <RubricManagementClient initialRubrics={initialRubrics} />
    </div>
  );
}
