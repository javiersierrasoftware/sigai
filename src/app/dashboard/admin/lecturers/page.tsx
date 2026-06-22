import { getSession } from "@/lib/actions/auth-actions"
import { redirect } from "next/navigation"
import { getLecturers } from "@/lib/actions/lecturer-actions"
import LecturersManagementClient from "./LecturersManagementClient"
import { getFaculties, getAllPrograms } from "@/lib/actions/admin-actions"

export default async function LecturersPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'vicerrectoria') redirect('/dashboard');

  const res = await getLecturers();
  const lecturers = res.success ? res.data : [];

  const resFaculties = await getFaculties();
  const resPrograms = await getAllPrograms();
  const faculties = resFaculties.success ? resFaculties.data : [];
  const programs = resPrograms.success ? resPrograms.data : [];

  return (
    <LecturersManagementClient 
      initialLecturers={lecturers}
      user={session.user}
      faculties={faculties}
      programs={programs}
    />
  );
}
