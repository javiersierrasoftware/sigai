import { getProjects } from "@/lib/actions/project-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import AdminProjectsClient from "./AdminProjectsClient";

export default async function AdminProjectsPage() {
  const session = await getSession();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ADMINDIUS')) {
     redirect("/dashboard");
  }

  const res = await getProjects();

  return (
    <AdminProjectsClient 
      initialProjects={res.success ? res.data : []} 
    />
  );
}
