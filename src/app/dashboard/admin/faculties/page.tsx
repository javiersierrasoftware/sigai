import { getFaculties } from "@/lib/actions/admin-actions";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";
import FacultyManagementClient from "./FacultyManagementClient";

export default async function AdminFacultiesPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const result = await getFaculties();
  const faculties = result.success ? result.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <FacultyManagementClient initialFaculties={faculties} />
    </div>
  );
}
