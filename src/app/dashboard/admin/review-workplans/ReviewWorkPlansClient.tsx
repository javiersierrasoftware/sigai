'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileCheck, 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  User, 
  Calendar, 
  Activity,
  ArrowLeft,
  ChevronRight,
  Filter,
  X,
  Send,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { updateWorkPlanStatus } from "@/lib/actions/plan-actions"

interface Props {
  initialPlans: any[]
  user: any
}

export default function ReviewWorkPlansClient({ initialPlans, user }: Props) {
  const [plans, setPlans] = useState(initialPlans)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [reviewComment, setReviewComment] = useState('')
  const [loading, setLoading] = useState(false)
  
  console.log("🔍 REVIEW CLIENT - INICIAL PLANS:", initialPlans);

  const filteredPlans = plans.filter(p => {
    const fullName = p.user?.fullName?.toLowerCase() || ""
    const identification = p.user?.identification || ""
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          identification.includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus
    return matchesSearch && matchesStatus
  })
  
  console.log("🎯 REVIEW CLIENT - FILTERED PLANS:", filteredPlans);

  const handleUpdateStatus = async (status: string) => {
    if (!reviewComment && status === 'REJECTED') {
        alert("Por favor proporcione un comentario de retroalimentación para el rechazo.")
        return
    }

    setLoading(true)
    const evaluatorId = user.id || user._id; // Compatibility check
    const res = await updateWorkPlanStatus(selectedPlan._id, status, reviewComment, evaluatorId)
    if (res.success) {
        setPlans(plans.map(p => p._id === selectedPlan._id ? { ...p, status, evaluatorComment: reviewComment } : p))
        setSelectedPlan(null)
        setReviewComment('')
        alert(`Plan de trabajo ${status === 'APPROVED' ? 'aprobado' : 'marcado para ajustes'} exitosamente.`)
    } else {
        alert("Error: " + res.error)
    }
    setLoading(false)
  }

  const getSubtotalByCategory = (plan: any, type: string) => {
    return (plan.activities || [])
      .filter((a: any) => a.type === type)
      .reduce((acc: number, a: any) => acc + (a.semesterHours || 0), 0)
  }

  const calculateTotalWeekly = (plan: any) => {
    return (plan.activities || []).reduce((acc: number, a: any) => acc + (a.weeklyHours || 0), 0)
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-12 font-outfit">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm text-slate-400 hover:text-primary transition-all font-black">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-serif text-slate-800 tracking-tight">Revisión Planes de Trabajo</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Auditoría semestral de carga docente institucional</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        <div className="md:col-span-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por nombre de docente o identificación..." 
              className="w-full h-16 bg-white border border-slate-100 rounded-[1.5rem] pl-16 pr-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-sm shadow-slate-100/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-4 flex gap-4">
           <div className="relative flex-1">
             <Filter className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
             <select 
              className="w-full h-16 bg-white border border-slate-100 rounded-[1.5rem] pl-12 pr-6 text-[11px] font-black uppercase tracking-widest text-slate-500 outline-none shadow-sm shadow-slate-100/50"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
             >
                <option value="ALL">TODOS LOS ESTADOS</option>
                <option value="SUBMITTED">RADICADOS</option>
                <option value="APPROVED">APROBADOS</option>
                <option value="REJECTED">RECHAZADOS</option>
             </select>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Docente</th>
                <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Facultad / Programa</th>
                <th className="text-center py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Periodo</th>
                <th className="text-center py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Carga Semanal</th>
                <th className="text-center py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Estado</th>
                <th className="text-right py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPlans.map((plan) => (
                <tr key={plan._id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="py-7 px-10">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {plan.user?.fullName?.[0] || 'D'}
                      </div>
                      <div>
                        <h4 className="font-serif text-slate-800 text-lg group-hover:text-primary transition-colors leading-none">{plan.user?.fullName || "Nombre no cargado"}</h4>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">ID: {plan.user?.identification || "No ID"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-7 px-4">
                    <div className="max-w-[200px]">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-tight">{plan.user?.profile?.faculty?.name || "Sin Facultad"}</p>
                      <p className="text-[11px] font-bold text-slate-500 mt-0.5 line-clamp-1">{plan.user?.profile?.program?.name || "Sin Programa"}</p>
                    </div>
                  </td>
                  <td className="py-7 px-4 text-center">
                    <span className="text-xs font-bold text-slate-600 font-outfit">{plan.semester}</span>
                  </td>
                  <td className="py-7 px-4 text-center">
                    <div className="flex flex-col items-center">
                       <span className={cn(
                        "text-sm font-black transition-colors",
                        calculateTotalWeekly(plan) > (plan.personalInfo?.weeklyHours || 40) ? "text-rose-500" : "text-emerald-500"
                       )}>
                          {calculateTotalWeekly(plan)} hrs
                       </span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">resolución: {plan.personalInfo?.weeklyHours}h</span>
                    </div>
                  </td>
                  <td className="py-7 px-4 text-center">
                    <div className={cn(
                        "inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        plan.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        plan.status === 'REJECTED' ? "bg-rose-50 text-rose-600 border-rose-100" :
                        plan.status === 'SUBMITTED' ? "bg-sky-50 text-sky-600 border-sky-100" :
                        "bg-slate-50 text-slate-400 border-slate-200"
                    )}>
                        {plan.status === 'SUBMITTED' ? 'Pendiente' : 
                         plan.status === 'APPROVED' ? 'Aprobado' : 
                         plan.status === 'REJECTED' ? 'Revisión' : 'Borrador'}
                    </div>
                  </td>
                  <td className="py-7 px-10 text-right">
                    <Button 
                      onClick={() => setSelectedPlan(plan)}
                      className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-200 font-bold uppercase tracking-widest text-[10px]"
                    >
                       Evaluar <ChevronRight className="ml-2 h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                     <div className="flex flex-col items-center gap-4 opacity-30">
                        <Activity className="h-14 w-14" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No se encontraron planes que coincidan</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
             >
                <div className="sticky top-0 bg-white border-b border-slate-50 p-10 flex justify-between items-center z-10">
                   <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-serif text-slate-800">{selectedPlan.user?.fullName}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest ">
                               Plan {selectedPlan.semester} • {selectedPlan.personalInfo?.typeOfBinding}
                            </p>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <p className="text-primary text-[10px] font-black uppercase tracking-widest">
                               {selectedPlan.user?.profile?.faculty?.name} / {selectedPlan.user?.profile?.program?.name}
                            </p>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => setSelectedPlan(null)} className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                      <X className="h-5 w-5" />
                   </button>
                </div>

                <div className="p-10 space-y-12">
                   {/* Summary Widgets */}
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {['DOCENCIA', 'INVESTIGACIÓN', 'EXTENSIÓN', 'INSTITUCIONAL'].map((cat) => (
                        <div key={cat} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center">
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{cat}</span>
                           <span className="text-2xl font-serif text-slate-900">{getSubtotalByCategory(selectedPlan, cat)}h</span>
                           <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mt-1">Semestrales</span>
                        </div>
                      ))}
                   </div>

                   {/* Activities Detailed List */}
                   <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-6">Detalle de Actividades</h4>
                      <div className="space-y-4">
                        {selectedPlan.activities.map((act: any, i: number) => (
                          <div key={i} className="bg-white border border-slate-50 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                             <div className="flex items-center gap-4">
                                <Activity className="h-5 w-5 text-slate-200" />
                                <div>
                                   <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">{act.type}</p>
                                   <p className="text-sm font-bold text-slate-700">{act.name}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-black text-slate-800">{act.weeklyHours} hrs/sem</p>
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{act.semesterHours} totales</p>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Evaluation Form */}
                   <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200">
                      <div className="flex items-center gap-3 mb-8">
                         <MessageSquare className="h-5 w-5 text-primary" />
                         <h4 className="text-xl font-serif tracking-tight">Evaluación y Retroalimentación</h4>
                      </div>
                      
                      <div className="space-y-6">
                         <textarea 
                           className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-medium text-white placeholder-white/20 outline-none focus:ring-2 focus:ring-primary/40 transition-all font-outfit"
                           placeholder="Escriba aquí sus observaciones o recomendaciones para el docente..."
                           value={reviewComment}
                           onChange={(e) => setReviewComment(e.target.value)}
                         />

                         <div className="grid grid-cols-2 gap-6 pt-4">
                            <Button 
                              onClick={() => handleUpdateStatus('REJECTED')}
                              disabled={loading}
                              variant="ghost"
                              className="h-16 rounded-2xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-bold uppercase tracking-widest text-[11px] border border-white/5"
                            >
                               <XCircle className="mr-2 h-4 w-4" /> {loading ? "..." : "Recomendar Ajustes"}
                            </Button>
                            <Button 
                              onClick={() => handleUpdateStatus('APPROVED')}
                              disabled={loading}
                              className="h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-900/50"
                            >
                               <CheckCircle2 className="mr-2 h-4 w-4" /> {loading ? "..." : "Aprobar Plan"}
                            </Button>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
