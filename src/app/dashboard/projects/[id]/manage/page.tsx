import { getProjectForExecution } from "@/lib/actions/execution-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect, notFound } from "next/navigation";
import ProjectExecutionClient from "./ProjectExecutionClient";

interface Props {
  params: { id: string }
}

export default async function ProjectManagePage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await props.params;
  const res = await getProjectForExecution(id);

  if (!res.success || !res.data) {
     return notFound();
  }

  return (
    <ProjectExecutionClient 
      project={res.data.project} 
      acts={res.data.acts} 
    />
  );
}
