'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Users,
  Calendar,
  ChevronLeft,
  Info,
  CheckCircle2,
  Clock,
  ClipboardList,
  Target,
  BarChart3,
  ShieldCheck,
  Building2,
  Mail,
  ArrowRight,
  Printer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Props {
  project: any
  call: any
  user: any
}

type Tab = 'GENERAL' | 'DOSSIER' | 'TEAM' | 'EXECUTION'

export default function ProjectDetailClient({ project, call, user }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL')

  const statusColors: Record<string, string> = {
    'DRAFT': 'bg-slate-50 text-slate-500 border-slate-200',
    'SUBMITTED': 'bg-sky-50 text-sky-600 border-sky-100',
    'UNDER_REVIEW': 'bg-amber-50 text-amber-600 border-amber-100',
    'APPROVED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'IN_EXECUTION': 'bg-primary/5 text-primary border-primary/20',
    'REJECTED': 'bg-rose-50 text-rose-600 border-rose-100'
  }

  const fieldConfig = call?.fieldConfig || {}

  const TABS = [
    { id: 'GENERAL', label: 'Generalidades', icon: Info },
    { id: 'DOSSIER', label: 'Expediente Técnico', icon: ClipboardList },
    { id: 'TEAM', label: 'Equipo Humano', icon: Users },
    { id: 'EXECUTION', label: 'Gestión / Actas', icon: BarChart3 },
  ] as const

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8 md:p-12 font-outfit pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Dossier Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
           <div className="flex items-center gap-6">
              <Link href={user.role === 'ADMIN' || user.role === 'ADMINDIUS' ? "/dashboard/admin/projects" : "/dashboard/projects"}>
                 <button className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm border border-slate-100">
                   <ChevronLeft className="h-5 w-5" />
                 </button>
              </Link>
              <div>
                 <div className="flex items-center gap-3 mb-1">
                    <span className={cn(
                       "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                       statusColors[project.status] || 'bg-slate-50'
                    )}>
                       {project.status}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">• Expediente: {project._id.substring(0, 8)}</span>
                 </div>
                 <h1 className="text-4xl font-serif text-slate-800 tracking-tighter italic">{project.title}</h1>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="h-12 border-slate-200 bg-white text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[9px] px-6 gap-2"
              >
                 <Printer className="h-4 w-4" /> Exportar PDF
              </Button>
              {(user.role === 'ADMIN' || user.role === 'ADMINDIUS') && project.status === 'APPROVED' && (
                <Link href={`/dashboard/projects/${project._id}/manage`}>
                  <Button className="h-12 bg-primary hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] px-8 shadow-xl shadow-emerald-200/50">
                    Gestionar Ejecución <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-2 rounded-3xl mb-12 flex gap-2 w-fit mx-auto shadow-sm">
           {TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all",
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
           ))}
        </div>

        {/* Dynamic Content Sections */}
        <div className="space-y-12">
           <AnimatePresence mode='wait'>
             {activeTab === 'GENERAL' && (
               <motion.div 
                 key="general"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="grid grid-cols-1 md:grid-cols-2 gap-8"
               >
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm space-y-8">
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                        <Info className="h-4 w-4 text-primary" /> Información Base de Investigación
                     </h3>
                     
                     <div className="space-y-6">
                        <div>
                           <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Descripción / Resumen Ejecutivo</label>
                           <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-50 text-sm leading-relaxed text-slate-600 font-medium">
                              {project.description || 'Sin descripción disponible.'}
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                           <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Presupuesto Asignado</p>
                              <p className="text-xl font-serif text-slate-800 italic">${(project.budget || 0).toLocaleString()} COP</p>
                           </div>
                           <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Inicio de Ejecución</p>
                              <p className="text-xl font-serif text-slate-800 italic">{new Date(project.startDate).toLocaleDateString()}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-3 mb-10 relative z-10">
                        <ShieldCheck className="h-4 w-4" /> Liderazgo y Responsabilidad
                     </h3>
                     
                     <div className="space-y-8 relative z-10">
                        <div className="flex items-center gap-6">
                           <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                             <Target className="h-8 w-8" />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Investigador Principal (PI)</p>
                              <p className="text-2xl font-serif italic text-white">{project.principalInvestigator}</p>
                           </div>
                        </div>

                        <div className="pt-8 border-t border-white/10 space-y-6">
                           <div className="flex items-center gap-4">
                              <Mail className="h-4 w-4 opacity-40" />
                              <span className="text-xs font-bold opacity-80">{project.leaderEmail}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <Building2 className="h-4 w-4 opacity-40" />
                              <span className="text-xs font-bold opacity-80">Unidad Ejecutora Dius / Institucional</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="absolute -right-16 -bottom-16 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-all duration-1000">
                        <ShieldCheck className="h-64 w-64" />
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'DOSSIER' && (
               <motion.div 
                 key="dossier"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm"
               >
                  <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
                     <div>
                        <h3 className="text-2xl font-serif text-slate-800 tracking-tight italic">Respuestas al Termino de Referencia</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Dossier Técnico Configurado por: {call?.name || 'Convocatoria Permanente'}</p>
                     </div>
                     <ClipboardList className="h-10 w-10 text-slate-100" />
                  </div>

                  <div className="grid grid-cols-1 gap-12 max-w-4xl mx-auto">
                     {Object.entries(project.dynamicData || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                                 <Plus className="h-4 w-4" />
                              </div>
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">{key.replace(/_/g, ' ')}</h4>
                           </div>
                           <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 text-sm leading-relaxed text-slate-600 font-medium shadow-inner whitespace-pre-wrap">
                              {value as string}
                           </div>
                        </div>
                     ))}
                     
                     {Object.keys(project.dynamicData || {}).length === 0 && (
                        <div className="py-24 text-center">
                           <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No se registraron datos técnicos avanzados para este proyecto.</p>
                        </div>
                     )}
                  </div>
               </motion.div>
             )}
             
             {activeTab === 'TEAM' && (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                   <Users className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                   <h3 className="text-xl font-serif text-slate-800 italic">Equipo Humano del Proyecto</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-sm mx-auto">Esta información está vinculada a los contratos de investigación asociados.</p>
                </div>
             )}

             {activeTab === 'EXECUTION' && (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                   <BarChart3 className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                   <h3 className="text-xl font-serif text-slate-800 italic">Historial de Seguimiento Dius</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Acceda a la bitácora técnica desde la gestión de ejecución.</p>
                   <Link href={`/dashboard/projects/${project._id}/manage`} className="inline-block mt-8">
                      <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px]">Ver Bitácora de Actas</Button>
                   </Link>
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
