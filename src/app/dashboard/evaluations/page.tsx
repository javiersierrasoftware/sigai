import { getEvaluationsByEvaluator } from "@/lib/actions/evaluation-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import EvaluationsListClient from "./EvaluationsListClient";

export default async function EvaluationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const res = await getEvaluationsByEvaluator(session.user.email);

  return (
    <EvaluationsListClient 
      evaluations={res.success ? res.data : []} 
    />
  );
}
