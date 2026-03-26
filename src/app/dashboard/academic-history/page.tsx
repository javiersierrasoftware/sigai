import { getAcademicHistory } from "@/lib/actions/academic-actions";
import AcademicHistoryClient from "./AcademicHistoryClient";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function AcademicHistoryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const historyResult = await getAcademicHistory();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-slate-900">
      <AcademicHistoryClient 
        history={historyResult.data || []} 
        user={session.user}
      />
    </div>
  );
}
