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
  Printer,
  UserPlus,
  Star,
  AlertCircle,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { assignEvaluator } from "@/lib/actions/evaluation-actions"

interface Props {
  project: any
  call: any
  user: any
  initialEvaluations?: any[]
}

type Tab = 'GENERAL' | 'DOSSIER' | 'TEAM' | 'EVALUATION' | 'EXECUTION'

export default function ProjectDetailClient({ project, call, user, initialEvaluations = [] }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL')
  const [evaluations, setEvaluations] = useState(initialEvaluations)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [loadingAssign, setLoadingAssign] = useState(false)
  const [newEvaluator, setNewEvaluator] = useState({ name: '', email: '' })

  const isAdmin = user.role === 'ADMIN' || user.role === 'ADMINDIUS'

  const statusColors: Record<string, string> = {
    'DRAFT': 'bg-slate-50 text-slate-500 border-slate-200',
    'SUBMITTED': 'bg-sky-50 text-sky-600 border-sky-100',
    'UNDER_REVIEW': 'bg-amber-50 text-amber-600 border-amber-100',
    'APPROVED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'IN_EXECUTION': 'bg-primary/5 text-primary border-primary/20',
    'REJECTED': 'bg-rose-50 text-rose-600 border-rose-100'
  }

  const TABS = [
    { id: 'GENERAL', label: 'Generalidades', icon: Info },
    { id: 'DOSSIER', label: 'Expediente Técnico', icon: ClipboardList },
    { id: 'TEAM', label: 'Equipo Humano', icon: Users },
    ...(isAdmin ? [{ id: 'EVALUATION', label: 'Evaluación / Pares', icon: Star }] : []),
    { id: 'EXECUTION', label: 'Gestión / Actas', icon: BarChart3 },
  ] as const

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAssign(true)
    const res = await assignEvaluator(project._id, newEvaluator)
    if (res.success) {
      setEvaluations([...evaluations, res.data])
      setShowAssignForm(false)
      setNewEvaluator({ name: '', email: '' })
    } else {
      alert(res.error)
    }
    setLoadingAssign(false)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8 md:p-12 font-outfit pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Dossier Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
           <div className="flex items-center gap-6">
              <Link href={isAdmin ? "/dashboard/admin/projects" : "/dashboard/projects"}>
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
              {isAdmin && project.status === 'APPROVED' && (
                <Link href={`/dashboard/projects/${project._id}/manage`}>
                  <Button className="h-12 bg-primary hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] px-8 shadow-xl shadow-emerald-200/50">
                    Gestionar Ejecución <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-2 rounded-3xl mb-12 flex gap-2 w-fit mx-auto shadow-sm overflow-x-auto max-w-full">
           {TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all whitespace-nowrap",
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
                 className="grid grid-cols-1 md:grid-cols-2 gap-8"
               >
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm space-y-8">
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                        <Info className="h-4 w-4 text-primary" /> Información Base de Investigación
                     </h3>
                     
                     <div className="space-y-6">
                        <div>
                           <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Descripción / Resumen Ejecutivo</label>
                           <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-50 text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap shadow-inner">
                              {project.description || 'Sin descripción disponible.'}
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                           <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50 shadow-inner">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Presupuesto Asignado</p>
                              <p className="text-xl font-serif text-slate-800 italic">${(project.budget || 0).toLocaleString()} COP</p>
                           </div>
                           <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50 shadow-inner">
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
                              <Mail className="h-4 w-4 opacity-40 text-emerald-400" />
                              <span className="text-xs font-bold opacity-80">{project.leaderEmail}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <Building2 className="h-4 w-4 opacity-40 text-emerald-400" />
                              <span className="text-xs font-bold opacity-80">Unidad Ejecutora Dius / Institucional</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'DOSSIER' && (
               <motion.div 
                 key="dossier"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-12"
               >
                  <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                     <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
                        <div>
                           <h3 className="text-2xl font-serif text-slate-800 tracking-tight italic">Árbol de Objetivos / Propósito</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Estructura Estratégica de la Propuesta</p>
                        </div>
                        <Target className="h-10 w-10 text-slate-100" />
                     </div>
                     <div className="space-y-10 max-w-4xl mx-auto">
                        <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-3">
                              <Star className="h-4 w-4" /> Objetivo General Institucional
                           </h4>
                           <p className="text-xl font-serif italic text-white/90 leading-relaxed relative z-10">{project.goals?.main || project.title}</p>
                           <div className="absolute -right-12 -bottom-12 opacity-5 -rotate-12 group-hover:rotate-0 transition-all duration-1000">
                             <Target className="h-48 w-48 text-white" />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {(project.goals?.specifics || ['Consolidar el ecosistema investigativo', 'Desarrollar productos de alto impacto']).map((g: string, i: number) => (
                             <div key={i} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-50 flex gap-6 items-start group hover:bg-white transition-all shadow-sm">
                                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm border border-slate-100 group-hover:text-primary transition-colors italic">{i+1}</div>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed flex-1">{g}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                     <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
                        <div>
                           <h3 className="text-2xl font-serif text-slate-800 tracking-tight italic">Respuestas al Termino de Referencia</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Dossier Técnico Configurado por: {call?.title || 'Convocatoria Permanente'}</p>
                        </div>
                        <ClipboardList className="h-10 w-10 text-slate-100" />
                     </div>

                     <div className="grid grid-cols-1 gap-12 max-w-4xl mx-auto">
                        {Object.entries(project.dynamicData || {}).map(([key, value]: [string, any]) => (
                           <div key={key} className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                                    <Plus className="h-4 w-4 text-emerald-600" />
                                 </div>
                                 <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">{key.replace(/_/g, ' ')}</h4>
                              </div>
                              <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 text-sm leading-relaxed text-slate-600 font-medium shadow-inner whitespace-pre-wrap">
                                 {value as string}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Schedule / Timeline Section */}
                  <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm">
                     <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50">
                        <Calendar className="h-8 w-8 text-primary" />
                        <h3 className="text-2xl font-serif text-slate-800 italic uppercase-first">Plan de Actividades Desarrollado</h3>
                     </div>
                     <div className="space-y-6">
                        {(project.schedule || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-8 items-center p-6 bg-slate-50/50 rounded-2xl border border-slate-50 group hover:bg-white transition-all shadow-sm">
                             <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[10px] font-black text-primary">M{item.month || idx + 1}</div>
                             <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-800">{item.activity || 'Actividad Principal de Investigación'}</h4>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Duración Estimada: {item.duration || 1} Meses</p>
                             </div>
                          </div>
                        ))}
                        {(!project.schedule || project.schedule.length === 0) && (
                          <p className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No se ha configurado un cronograma técnico aún.</p>
                        )}
                     </div>
                  </div>
               </motion.div>
             )}

             {activeTab === 'TEAM' && (
               <motion.div 
                 key="team"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-8"
               >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {(project.teamMembers || []).map((member: any, idx: number) => (
                        <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden hover:shadow-xl transition-all duration-500">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                 <Users className="h-6 w-6" />
                              </div>
                              <div>
                                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                    {member.role}
                                 </span>
                                 <p className="text-sm font-black text-slate-800 mt-1">{member.firstName} {member.lastName}</p>
                              </div>
                           </div>
                           
                           <div className="space-y-4 pt-4 border-t border-slate-50">
                              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                 <span className="text-slate-400">Dedicación:</span>
                                 <span className="text-slate-800">{member.dedication}h/Sem</span>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                 <span className="text-slate-400">Periodo:</span>
                                 <span className="text-slate-800">{member.months} Meses</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-50 group-hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-all">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Presupuesto Cargo:</span>
                                 <span className="text-xs font-serif text-primary italic font-bold">${((member.dedication || 0) * 4 * (member.months || 0) * (member.hourlyRate || 0)).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
                  {(!project.teamMembers || project.teamMembers.length === 0) && (
                     <div className="py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200">
                        <Users className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-serif text-slate-800 italic">No se ha vinculado equipo humano aún</h3>
                     </div>
                  )}
               </motion.div>
             )}

             {activeTab === 'EVALUATION' && isAdmin && (
               <motion.div 
                 key="evaluation"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-8"
               >
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-serif text-slate-800 italic">Panel de Evaluación por Pares</h3>
                     <Button 
                       onClick={() => setShowAssignForm(true)}
                       className="h-12 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] px-8"
                     >
                        <UserPlus className="mr-2 h-4 w-4 text-emerald-400" /> Asignar Evaluador
                     </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {evaluations.map((evalItem: any) => (
                        <div key={evalItem._id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                 <Users className="h-6 w-6" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">EVALUADOR</p>
                                 <p className="text-sm font-bold text-slate-800">{evalItem.evaluatorName}</p>
                              </div>
                           </div>
                           
                           <div className="space-y-4 pt-4 border-t border-slate-50">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                 <span className="text-slate-400">Estado:</span>
                                 <span className={cn(
                                   "px-2 py-1 rounded-lg",
                                   evalItem.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                 )}>{evalItem.status}</span>
                              </div>
                              {evalItem.status === 'COMPLETED' && (
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Puntaje:</span>
                                   <span className="text-2xl font-serif text-primary italic font-bold">{evalItem.score} pts</span>
                                </div>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
             )}

             {activeTab === 'EXECUTION' && (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                   <BarChart3 className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                   <h3 className="text-xl font-serif text-slate-800 italic">Bitácora Técnica Administrativa DIUS</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 max-w-sm mx-auto">Consulte las actas de inicio y seguimiento radicadas durante el periodo de ejecución.</p>
                   {project.status === 'APPROVED' || project.status === 'IN_EXECUTION' ? (
                     <Link href={`/dashboard/projects/${project._id}/manage`} className="inline-block mt-8">
                        <Button className="h-14 px-10 bg-primary hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-100">Abrir Terminal de Ejecución</Button>
                     </Link>
                   ) : (
                     <p className="mt-8 text-rose-500 font-bold uppercase tracking-widest text-[9px] bg-rose-50 px-6 py-2 rounded-xl border border-rose-100 inline-block italic">Gestión habilitada únicamente para proyectos aprobados.</p>
                   )}
                </div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Assign Evaluator Modal */}
      <AnimatePresence>
        {showAssignForm && (
          <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white w-full max-w-md rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden"
             >
                <h3 className="text-3xl font-serif text-slate-800 mb-2 italic">Asignar Evaluador</h3>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-10">Peer-review institutional cycle</p>
                
                <form onSubmit={handleAssign} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Completo</label>
                      <input 
                        required
                        value={newEvaluator.name}
                        onChange={e => setNewEvaluator({...newEvaluator, name: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm shadow-inner"
                        placeholder="Ej: Dr. Julian Perez"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</label>
                      <input 
                        required
                        type="email"
                        value={newEvaluator.email}
                        onChange={e => setNewEvaluator({...newEvaluator, email: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm shadow-inner"
                        placeholder="julian.perez@universidad.edu.co"
                      />
                   </div>

                   <div className="pt-8 flex gap-4">
                      <Button type="button" variant="ghost" onClick={() => setShowAssignForm(false)} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancelar</Button>
                      <Button disabled={loadingAssign} type="submit" className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-200/50">
                        {loadingAssign ? 'Asignando...' : 'Confirmar Asignación'}
                      </Button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
