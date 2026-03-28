import { getProjectsByUser } from "@/lib/actions/project-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import ProjectsListClient from "./ProjectsListClient";

import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: projects } = (session.user.role === 'ADMIN' || session.user.role === 'ADMINDIUS') 
    ? await (await import("@/lib/actions/project-actions")).getProjects()
    : await getProjectsByUser();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader 
        user={session.user} 
        breadcrumbs={[{ label: 'Proyectos', active: true }]} 
      />
      <div className="py-4">
        <ProjectsListClient initialProjects={projects || []} />
      </div>
    </div>
  );
}
