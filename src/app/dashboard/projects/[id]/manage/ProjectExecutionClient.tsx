'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Calendar,
  Clock,
  ChevronLeft,
  Plus,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  MessageSquare,
  ArrowRight,
  ClipboardCheck,
  History,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { submitProjectAct } from "@/lib/actions/execution-actions"

interface Props {
  project: any
  acts: any[]
}

export default function ProjectExecutionClient({ project, acts }: Props) {
  const [showAddAct, setShowAddAct] = useState(false)
  const [loading, setLoading] = useState(false)
  const [actType, setActType] = useState<'INICIO' | 'SEGUIMIENTO'>('SEGUIMIENTO')
  
  const [formData, setFormData] = useState({
    summary: '',
    achievements: '',
    progressPercentage: 0,
    projectId: project._id
  })

  const hasStartAct = acts.some(a => a.type === 'INICIO')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const data = new FormData()
    data.append('projectId', project._id)
    data.append('type', actType)
    data.append('summary', formData.summary)
    data.append('achievements', formData.achievements)
    data.append('progressPercentage', formData.progressPercentage.toString())
    
    const res = await submitProjectAct(data)
    if (res.success) {
      setShowAddAct(false)
      setFormData({ summary: '', achievements: '', progressPercentage: 0, projectId: project._id })
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-outfit">
      
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/projects">
              <button className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
               <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    En Ejecución
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    ID: {project._id.substring(0, 8)}
                  </span>
               </div>
               <h1 className="text-xl font-serif text-slate-800 tracking-tight leading-tight">{project.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button 
               onClick={() => {
                 setActType(hasStartAct ? 'SEGUIMIENTO' : 'INICIO')
                 setShowAddAct(true)
               }}
               className="h-12 px-8 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200"
             >
                <Plus className="mr-2 h-4 w-4" /> {hasStartAct ? 'Nueva Acta de Seguimiento' : 'Radicar Acta de Inicio'}
             </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           
           {/* Left Column: Management Timeline */}
           <div className="lg:col-span-2 space-y-8">
              
              <div className="flex items-center justify-between px-2 mb-4">
                 <h2 className="text-3xl font-serif text-slate-800 tracking-tight italic">Bitácora de Ejecución Institutional</h2>
                 <div className="h-1 w-24 bg-emerald-500 rounded-full" />
              </div>

              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-8 before:w-0.5 before:bg-slate-100 before:-z-10">
                 
                 {acts.map((act, idx) => (
                   <motion.div 
                     key={act._id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm relative group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
                   >
                     {/* Connector Dot */}
                     <div className={cn(
                       "absolute left-[-2.3rem] top-10 h-10 w-10 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-110",
                       act.type === 'INICIO' ? "bg-emerald-500 text-white" : "bg-white text-slate-300 border-slate-50"
                     )}>
                        {act.type === 'INICIO' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                     </div>

                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "h-12 w-12 rounded-2xl flex items-center justify-center",
                             act.type === 'INICIO' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                           )}>
                              {act.type === 'INICIO' ? <ClipboardCheck className="h-6 w-6" /> : <History className="h-6 w-6" />}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.type === 'INICIO' ? 'Acta de Inicio Ministerial / Institucional' : 'Acta de Seguimiento Técnico'}</p>
                              <p className="text-xs font-bold text-slate-800 mt-0.5">{new Date(act.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={cn(
                             "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                             act.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                           )}>
                              {act.status}
                           </span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Resumen de Actividad</h4>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium">{act.summary}</p>
                        </div>
                        {act.achievements && (
                          <div className="p-6 bg-emerald-50/20 rounded-2xl border border-emerald-50/50">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Logros Alcanzados</h4>
                             <p className="text-sm text-slate-600 leading-relaxed font-medium">{act.achievements}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                           <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                 <BarChart3 className="h-4 w-4 text-emerald-500" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progreso: {act.progressPercentage}%</span>
                              </div>
                           </div>
                           <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest text-primary h-8">Ver Soporte <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button>
                        </div>
                     </div>
                   </motion.div>
                 ))}

                 {acts.length === 0 && (
                   <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 border-dashed">
                      <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                         <Info className="h-10 w-10" />
                      </div>
                      <h3 className="text-xl font-serif text-slate-800 mb-2">Proyecto sin Actas Radicadas</h3>
                      <p className="text-sm text-slate-400 font-medium uppercase tracking-[0.2em] mb-10 max-w-sm mx-auto">Active la ejecución formalizando el Acta de Inicio.</p>
                      <Button 
                         onClick={() => {
                           setActType('INICIO')
                           setShowAddAct(true)
                         }}
                         className="h-14 px-10 bg-primary hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-200/50"
                      >
                         Crear Acta de Inicio
                      </Button>
                   </div>
                 )}
              </div>
           </div>

           {/* Right Column: Project Context */}
           <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
                 <h3 className="text-xl font-bold font-outfit mb-6 text-emerald-400">Indicadores de Gestión</h3>
                 <div className="space-y-8 relative z-10">
                    <div>
                       <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Avance Técnico General</span>
                          <span className="text-2xl font-serif text-emerald-400 italic">{acts[0]?.progressPercentage || 0}%</span>
                       </div>
                       <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${acts[0]?.progressPercentage || 0}%` }}
                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-2">Meses Ejecutados</p>
                          <p className="text-2xl font-serif leading-none italic">04</p>
                       </div>
                       <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-2">Entregables</p>
                          <p className="text-2xl font-serif leading-none italic">02</p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute -right-12 -bottom-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <History className="h-64 w-64" />
                 </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative group overflow-hidden">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-8 pb-4 border-b border-slate-50 flex items-center justify-between">
                    Asistencia Técnica DIUS
                    <MessageSquare className="h-4 w-4 text-emerald-500" />
                 </h3>
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <AlertCircle className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Recuerde</p>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                             Las actas de seguimiento deben radicarse mensualmente para la liberación de recursos del periodo.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Slide-over Form Overlay for New Act */}
      <AnimatePresence>
        {showAddAct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex justify-end"
          >
             <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="w-full max-w-xl bg-white h-screen shadow-2xl p-12 overflow-y-auto"
             >
                <div className="flex items-center justify-between mb-12">
                   <div>
                      <h2 className="text-4xl font-serif text-slate-800 tracking-tighter">Nueva Acta</h2>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Radicación de {actType.toLowerCase()} institucional</p>
                   </div>
                   <Button onClick={() => setShowAddAct(false)} variant="ghost" className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:rotate-90 transition-all">
                      <Plus className="h-6 w-6 rotate-45" />
                   </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Acta</label>
                      <div className="grid grid-cols-2 gap-4">
                         {['INICIO', 'SEGUIMIENTO'].map(t => (
                           <button 
                             key={t}
                             type="button"
                             disabled={t === 'INICIO' && hasStartAct}
                             onClick={() => setActType(t as any)}
                             className={cn(
                               "h-14 rounded-2xl font-bold uppercase tracking-widest text-[9px] border transition-all flex items-center justify-center gap-2",
                               actType === t 
                                 ? "bg-primary border-primary text-white shadow-lg shadow-emerald-200/50" 
                                 : "bg-white border-slate-100 text-slate-400 hover:border-slate-200",
                               t === 'INICIO' && hasStartAct && "opacity-50 grayscale cursor-not-allowed"
                             )}
                           >
                              {t === 'INICIO' ? <ClipboardCheck className="h-4 w-4" /> : <History className="h-4 w-4" />}
                              {t}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Resumen del Periodo / Justificación</label>
                      <textarea 
                        rows={5}
                        required
                        value={formData.summary}
                        onChange={(e) => setFormData({...formData, summary: e.target.value})}
                        placeholder="Escriba el resumen ejecutivo detallado..."
                        className="w-full px-6 py-5 bg-slate-50/50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium leading-relaxed resize-none shadow-inner"
                      />
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Compromisos / Logros Técnicos</label>
                      <textarea 
                        rows={5}
                        value={formData.achievements}
                        onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                        placeholder="Describa los hitos técnicos alcanzados en este periodo..."
                        className="w-full px-6 py-5 bg-slate-50/50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium leading-relaxed resize-none shadow-inner"
                      />
                   </div>

                   <div className="space-y-3">
                      <div className="flex justify-between items-center ml-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Porcentaje de Avance (%)</label>
                         <span className="text-2xl font-serif text-primary italic">{formData.progressPercentage}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progressPercentage}
                        onChange={(e) => setFormData({...formData, progressPercentage: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                   </div>

                   <div className="pt-10 space-y-4">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-16 bg-primary hover:bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-200 transition-all group"
                      >
                         {loading ? 'Procesando...' : <><Send className="mr-3 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Radicar Acta en DIUS</>}
                      </Button>
                      <p className="text-[9px] text-center text-slate-300 uppercase tracking-widest font-medium">Esta acción notificará automáticamente a la División de Investigación</p>
                   </div>
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
