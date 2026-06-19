import { getSession } from "@/lib/actions/auth-actions"
import { redirect } from "next/navigation"
import { getLecturers } from "@/lib/actions/lecturer-actions"
import LecturersManagementClient from "./LecturersManagementClient"

export default async function LecturersPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'vicerrectoria') redirect('/dashboard');

  const res = await getLecturers();
  const lecturers = res.success ? res.data : [];

  return (
    <LecturersManagementClient 
      initialLecturers={lecturers}
      user={session.user}
    />
  );
}
