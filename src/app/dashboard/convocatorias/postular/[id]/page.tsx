import { getProjectCallById } from "@/lib/actions/project-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect, notFound } from "next/navigation";
import ProjectSubmissionClient from "./ProjectSubmissionClient";

interface Props {
  params: { id: string }
}

export default async function ApplyPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await props.params;

  const [callRes, linesRes] = await Promise.all([
    getProjectCallById(id),
    import("@/lib/actions/admin-actions").then(m => m.getResearchLines())
  ]);

  if (!callRes.data) return notFound();

  return (
    <ProjectSubmissionClient 
      call={callRes.data} 
      user={session.user} 
      researchLines={linesRes.success ? linesRes.data : []} 
    />
  );
}
