import { getSession } from "@/lib/actions/auth-actions"
import { redirect } from "next/navigation"
import { getCiarpDashboardData } from "@/lib/actions/ciarp-actions"
import CiarpAdminClient from "./CiarpAdminClient"

export default async function CiarpAdminPage() {
  const session = await getSession()
  
  if (!session || session.user.role !== 'ADMINCIARP') {
    redirect('/dashboard')
  }

  const res = await getCiarpDashboardData();

  if (!res.success) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-serif text-slate-800 italic">Error cargando panel CIARP</h2>
        <p className="text-slate-400 mt-2">{res.error}</p>
      </div>
    );
  }

  return (
    <CiarpAdminClient 
      user={session.user} 
      data={res.data || { pendingSubmissions: [], addressedSubmissions: [], lecturers: [], actas: [] }} 
    />
  )
}
