import { getSession } from "@/lib/actions/auth-actions";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongoose";
import ProjectEvaluation from "@/lib/models/ProjectEvaluation";
import { getProjectById, getRubricById } from "@/lib/actions/project-actions";
import EvaluationFormClient from "./EvaluationFormClient";

export default async function EvaluationDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await props.params;
  
  await connectDB();
  const evaluation = await ProjectEvaluation.findById(id).lean();
  if (!evaluation) return notFound();

  // Security check: only the assigned evaluator or an admin
  if (evaluation.evaluatorEmail !== session.user.email && session.user.role !== 'ADMIN' && session.user.role !== 'ADMINDIUS') {
     redirect("/dashboard/evaluations");
  }

  const projectRes = await getProjectById(evaluation.projectId.toString());
  const rubricRes = await getRubricById(evaluation.rubricId.toString());

  return (
    <EvaluationFormClient 
      evaluation={JSON.parse(JSON.stringify(evaluation))}
      project={projectRes.success ? projectRes.data : null}
      rubric={rubricRes.success ? rubricRes.data : null}
    />
  );
}
