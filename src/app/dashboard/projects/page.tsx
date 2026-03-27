import { getProjectsByUser } from "@/lib/actions/project-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import ProjectsListClient from "./ProjectsListClient";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: projects } = (session.user.role === 'ADMIN' || session.user.role === 'ADMINDIUS') 
    ? await (await import("@/lib/actions/project-actions")).getProjects()
    : await getProjectsByUser();

  return (
    <ProjectsListClient initialProjects={projects || []} />
  );
}
