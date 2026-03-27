import { getOpenProjectCalls } from "@/lib/actions/project-actions";
import ProjectCallsListClient from "./ProjectCallsListClient";
import { getSession } from "@/lib/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function ConvocatoriasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { data: calls } = await getOpenProjectCalls();

  return (
    <ProjectCallsListClient initialCalls={calls || []} />
  );
}
