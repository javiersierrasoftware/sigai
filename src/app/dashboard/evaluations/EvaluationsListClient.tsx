'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Search,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  Target,
  BarChart3,
  Calendar,
  AlertCircle,
  TrendingUp,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Props {
  evaluations: any[]
}

export default function EvaluationsListClient({ evaluations }: Props) {
  const [filter, setFilter] = useState<'PENDING' | 'COMPLETED' | 'ALL'>('PENDING')

  const filtered = evaluations.filter(e => {
    if (filter === 'ALL') return true
    return e.status === filter
  })

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8 md:p-12 font-outfit pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm shadow-emerald-100">
                    <Star className="h-6 w-6" />
                 </div>
                 <Link href="/dashboard">
                    <button className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm border border-slate-100">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                 </Link>
                 <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Institutional Peer-Review Cycle</h2>
              </div>
              <h1 className="text-5xl font-serif text-slate-800 tracking-tighter italic">Terminal de Evaluación DIUS</h1>
              <p className="text-slate-400 font-bold text-sm mt-3 opacity-80 uppercase tracking-widest max-w-lg leading-relaxed">Gestione la calidad de la investigación institucional mediante la rúbrica de calificación por pares.</p>
           </div>
           
           <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-2 rounded-3xl flex gap-1 shadow-sm">
              {[
                { id: 'PENDING', label: 'Pendientes' },
                { id: 'COMPLETED', label: 'Completadas' },
                { id: 'ALL', label: 'Historial' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setFilter(opt.id as any)}
                  className={cn(
                    "px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === opt.id 
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
           </div>
        </div>

        {/* Evaluations Grid */}
        <div className="grid grid-cols-1 gap-6">
           {filtered.map((evalItem, idx) => (
             <motion.div 
               key={evalItem._id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               className="bg-white rounded-[2.5rem] p-4 pr-10 border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-emerald-200/20 transition-all duration-500 overflow-hidden relative group"
             >
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                   {/* Left: Project Preview */}
                   <div className="lg:w-[45%] p-6 flex gap-6">
                      <div className="h-20 w-20 shrink-0 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-6">
                         <FileText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                         <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: {evalItem.projectId?._id.substring(0, 8)}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                              evalItem.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                            )}>{evalItem.status}</span>
                         </div>
                         <h3 className="text-xl font-serif text-slate-800 truncate italic">{evalItem.projectId?.title}</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Líder: {evalItem.projectId?.principalInvestigator}</p>
                      </div>
                   </div>

                   {/* Middle: Metrics */}
                   <div className="lg:flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 p-6 lg:border-l border-slate-50">
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                           <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> CALIFICACIÓN
                         </p>
                         <p className="text-2xl font-serif text-slate-800 italic">{evalItem.status === 'COMPLETED' ? `${evalItem.score} pts` : '--'}</p>
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                           <Calendar className="h-3.5 w-3.5 text-sky-500" /> ASIGNADO
                         </p>
                         <p className="text-sm font-bold text-slate-800">{new Date(evalItem.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>

                   {/* Right: Actions */}
                   <div className="lg:w-[15%] p-6 flex lg:justify-end items-center">
                      {evalItem.status !== 'COMPLETED' ? (
                        <Link href={`/dashboard/evaluations/${evalItem._id}`}>
                           <Button className="h-14 px-10 bg-primary hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-200/50 group-hover:scale-105 transition-all">
                             Evaluar Ahora <ChevronRight className="ml-2 h-4 w-4" />
                           </Button>
                        </Link>
                      ) : (
                        <Link href={`/dashboard/evaluations/${evalItem._id}`}>
                           <Button variant="ghost" className="h-14 px-8 rounded-2xl border border-slate-100 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-primary transition-all">
                             Ver Calificación <ChevronRight className="ml-2 h-4 w-4" />
                           </Button>
                        </Link>
                      )}
                   </div>
                </div>
                
                {/* Background Shadow Ornament */}
                <Star className="absolute -right-12 -bottom-12 h-48 w-48 opacity-[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
             </motion.div>
           ))}

           {filtered.length === 0 && (
              <div className="py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-inner">
                 <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200 group-hover:scale-110 transition-transform">
                    <Star className="h-12 w-12" />
                 </div>
                 <h3 className="text-2xl font-serif text-slate-800 italic mb-3">No hay evaluaciones que coincidan con el filtro</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">Su bandeja de entrada de pares académicos se actualizará cuando la DIUS le asigne nuevas propuestas de investigación.</p>
              </div>
           )}
        </div>
      </div>
    </main>
  )
}
