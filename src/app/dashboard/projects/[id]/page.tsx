import { getProjectById } from "@/lib/actions/project-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect, notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await props.params;
  const res = await getProjectById(id);

  if (!res.success || !res.data) {
     return notFound();
  }

  // Also fetch the call to know the field names
  const { getProjectCallById } = await import("@/lib/actions/project-actions");
  const callRes = await getProjectCallById(res.data.projectCallId);

  // Fetch evaluations for this project
  const { getProjectEvaluations } = await import("@/lib/actions/evaluation-actions");
  const evalRes = await getProjectEvaluations(id);

  return (
    <ProjectDetailClient 
      project={res.data} 
      call={callRes.success ? callRes.data : null}
      user={session.user}
      initialEvaluations={evalRes.success ? evalRes.data : []}
    />
  );
}
