'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Calendar,
  Clock,
  ChevronLeft,
  Search,
  Plus,
  ArrowRight,
  ClipboardList,
  Target,
  BarChart3,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Props {
  initialProjects: any[]
}

const statusColors: Record<string, string> = {
  'DRAFT': 'bg-slate-50 text-slate-500 border-slate-200',
  'SUBMITTED': 'bg-sky-50 text-sky-600 border-sky-100',
  'UNDER_REVIEW': 'bg-amber-50 text-amber-600 border-amber-100',
  'APPROVED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'IN_EXECUTION': 'bg-primary/5 text-primary border-primary/20',
  'REJECTED': 'bg-rose-50 text-rose-600 border-rose-100'
}

export default function ProjectsListClient({ initialProjects }: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = initialProjects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8 pb-10">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link href="/dashboard">SIGAI</Link>
            <span className="text-slate-200">/</span>
            <span className="text-primary">Mis Proyectos</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-slate-800">Trayectoria Investigativa</h1>
            <p className="text-slate-400 mt-1 max-w-2xl leading-relaxed text-[11px] uppercase tracking-widest font-medium">
              Gestione y seguimiento de sus proyectos de investigación activos e históricos.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <Link href="/dashboard/convocatorias">
                <Button className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200/50 transition-all duration-300 font-bold uppercase tracking-widest text-[10px] rounded-xl group border-0">
                  <Plus className="mr-3 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  NUEVO PROYECTO
                </Button>
             </Link>
          </div>
        </div>

        {/* Search Bar - Premium Glassy but matched to Dashboard margins */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
           <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="BUSCAR POR TÍTULO DE PROYECTO..."
                className="w-full h-10 pl-10 pr-6 bg-slate-50/50 border-transparent rounded-lg text-[9px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 px-2 overflow-x-auto scrollbar-hide">
              {['TODOS', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].map(status => (
                 <button key={status} className={cn(
                    "px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap",
                    status === 'TODOS' ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                 )}>
                    {status}
                 </button>
              ))}
           </div>
        </div>

        {/* Grid - Matching Dashboard card style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-500">
                   <FileText className="h-8 w-8" />
                </div>

                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm",
                        statusColors[project.status] || 'bg-slate-50 text-slate-400 border-slate-100'
                      )}>
                        {project.status}
                      </span>
                      <button className="h-8 w-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-200 hover:text-slate-400 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                   </div>
                   <h3 className="text-xl font-serif text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight tracking-tight truncate">
                     {project.title}
                   </h3>
                   <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-widest opacity-60">
                     Líder: <span className="text-slate-600">{project.principalInvestigator}</span>
                   </p>

                   <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
                            <BarChart3 className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Presupuesto</p>
                            <p className="text-[11px] font-bold text-slate-700 tracking-tighter">${(project.budget || 0).toLocaleString()}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 shadow-sm">
                            <Calendar className="h-4 w-4" />
                         </div>
                         <div>
                            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Radicado</p>
                            <p className="text-[11px] font-bold text-slate-700 tracking-tighter">{new Date(project.startDate).toLocaleDateString()}</p>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center justify-end mt-4 gap-3">
                      <Link href={`/dashboard/projects/${project._id}`}>
                        <Button variant="ghost" className="h-10 px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                           Detalles <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                      {(project.status === 'APPROVED' || project.status === 'IN_EXECUTION') && (
                        <Link href={`/dashboard/projects/${project._id}/manage`}>
                          <Button className="h-10 px-5 bg-primary hover:bg-emerald-600 text-white shadow-xl shadow-emerald-200/50 transition-all duration-300 font-black uppercase tracking-widest text-[9px] rounded-xl border-0">
                            Gestión Ejecución <BarChart3 className="ml-2 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                   </div>
                </div>
              </div>

              {/* Decoration */}
              <div className="absolute -right-6 -top-6 opacity-[0.01] rotate-12 group-hover:scale-110 transition-transform duration-1000">
                 <Target className="h-24 w-24 text-emerald-900" />
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
           <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                 <ClipboardList className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-serif text-slate-800 mb-2">Aún no tiene proyectos registrados</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto font-medium tracking-widest uppercase mb-8">Comience postulándose a una de las convocatorias vigentes.</p>
              <Link href="/dashboard/convocatorias">
                 <Button className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-200/50 border-0">
                    EXPLORAR CONVOCATORIAS
                 </Button>
              </Link>
           </div>
        )}
      </div>
    </div>
  )
}
