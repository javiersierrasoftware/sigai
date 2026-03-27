'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ChevronLeft,
  Info,
  CheckCircle2,
  Clock,
  ClipboardList,
  Target,
  BarChart3,
  ShieldCheck,
  Building2,
  Save,
  Send,
  ArrowRight,
  AlertCircle,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { submitEvaluation } from "@/lib/actions/evaluation-actions"

interface Props {
  evaluation: any
  project: any
  rubric: any
}

export default function EvaluationFormClient({ evaluation: initialEval, project, rubric }: Props) {
  const [evaluation, setEvaluation] = useState(initialEval)
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState<any[]>(
    rubric?.criteria.map((c: any) => ({
      name: c.name,
      score: initialEval.criteriaScores?.find((s: any) => s.name === c.name)?.score || 0,
      comment: initialEval.criteriaScores?.find((s: any) => s.name === c.name)?.comment || ''
    })) || []
  )
  const [overallComment, setOverallComment] = useState(initialEval.comments || '')

  const totalScore = scores.reduce((acc, curr) => acc + curr.score, 0)
  const maxPossible = rubric?.criteria.reduce((acc: number, curr: any) => acc + curr.maxScore, 0) || 100

  const handleScoreChange = (index: number, score: number) => {
    const newScores = [...scores]
    newScores[index].score = score
    setScores(newScores)
  }

  const handleCommentChange = (index: number, comment: string) => {
    const newScores = [...scores]
    newScores[index].comment = comment
    setScores(newScores)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await submitEvaluation(evaluation._id, scores, overallComment)
    if (res.success) {
      window.location.href = '/dashboard/evaluations'
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-outfit">
      
      {/* Dossier Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-28 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <Link href="/dashboard/evaluations">
                 <button className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm border border-slate-100">
                   <ChevronLeft className="h-5 w-5" />
                 </button>
              </Link>
              <div>
                 <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Rúbrica: {rubric?.name}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest"> ID: {project?._id.substring(0, 8)}</span>
                 </div>
                 <h1 className="text-xl font-serif text-slate-800 tracking-tight leading-tight">{project?.title}</h1>
              </div>
           </div>

           <div className="flex items-center gap-6 pr-4">
              <div className="text-right">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Puntaje Preliminar</p>
                 <p className="text-4xl font-serif text-slate-800 italic leading-none">{totalScore} <span className="text-lg opacity-30">/ {maxPossible}</span></p>
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={loading || evaluation.status === 'COMPLETED'}
                className="h-14 px-10 bg-primary hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-200/50"
              >
                 {loading ? 'Transmitiendo...' : (evaluation.status === 'COMPLETED' ? 'Calificación Radicada' : <><Send className="mr-3 h-4 w-4" /> Finalizar Evaluación</>)}
              </Button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
           
           {/* Evaluation Criteria Form */}
           <div className="lg:col-span-2 space-y-12">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                 <h2 className="text-4xl font-serif text-slate-800 tracking-tighter italic">Criterios de Valoración DIUS</h2>
                 <BarChart3 className="h-10 w-10 text-slate-100" />
              </div>

              {scores.map((s, idx) => {
                const config = rubric.criteria[idx]
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm relative group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
                  >
                     <div className="flex items-start justify-between mb-10">
                        <div className="max-w-[80%]">
                           <div className="flex items-center gap-4 mb-3">
                              <span className="h-8 w-8 rounded-[1rem] bg-primary/5 text-primary flex items-center justify-center font-serif italic text-lg">{idx + 1}</span>
                              <h4 className="text-xl font-serif text-slate-800 italic">{config.name}</h4>
                           </div>
                           <p className="text-sm text-slate-500 font-medium leading-relaxed uppercase tracking-wide opacity-80 pl-12">{config.instruction}</p>
                        </div>
                        <div className="text-right">
                           <div className="text-3xl font-serif text-primary italic leading-none mb-1">{s.score} <span className="text-sm opacity-20">/ {config.maxScore}</span></div>
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Puntos Asignados</p>
                        </div>
                     </div>

                     <div className="space-y-10 pl-12">
                        <div className="space-y-4">
                           <input 
                              type="range"
                              min="0"
                              max={config.maxScore}
                              step="0.5"
                              value={s.score}
                              disabled={evaluation.status === 'COMPLETED'}
                              onChange={(e) => handleScoreChange(idx, parseFloat(e.target.value))}
                              className="w-full h-2.5 bg-slate-50 rounded-full appearance-none cursor-pointer accent-primary shadow-inner"
                           />
                           <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">
                              <span>Deficiente (0)</span>
                              <span>Sobresaliente ({config.maxScore})</span>
                           </div>
                        </div>

                        {config.commentsEnabled && (
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Observaciones Específicas del Criterio</label>
                              <textarea 
                                rows={4}
                                disabled={evaluation.status === 'COMPLETED'}
                                value={s.comment}
                                onChange={(e) => handleCommentChange(idx, e.target.value)}
                                placeholder="Justifique su calificación para este criterio aquí..."
                                className="w-full px-8 py-6 bg-slate-50/50 border-none rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium leading-relaxed resize-none shadow-inner"
                              />
                           </div>
                        )}
                     </div>
                  </motion.div>
                )
              })}

              <div className="bg-slate-900 rounded-[3rem] p-16 text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10 space-y-8">
                    <div>
                       <h3 className="text-3xl font-serif italic text-emerald-400 mb-2">Comentarios Generales / Concepto Final</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Resumen cualitativo de la evaluación institucional</p>
                    </div>
                    
                    <textarea 
                      rows={6}
                      disabled={evaluation.status === 'COMPLETED'}
                      value={overallComment}
                      onChange={(e) => setOverallComment(e.target.value)}
                      placeholder="Describa su concepto técnico final sobre la viabilidad de la propuesta..."
                      className="w-full px-10 py-8 bg-white/5 border-white/10 border rounded-[2.5rem] focus:bg-white/10 transition-all outline-none text-sm font-medium leading-relaxed resize-none"
                    />
                 </div>
                 <Star className="absolute -right-20 -bottom-20 h-80 w-80 text-white/[0.03] -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              </div>
           </div>

           {/* Project context sidebar */}
           <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm sticky top-40">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 mb-8 pb-4 border-b border-slate-50 flex items-center justify-between">
                    Resumen de Propuesta
                    <Target className="h-4 w-4 text-primary" />
                 </h3>
                 <div className="space-y-6">
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Descripción</p>
                       <p className="text-xs text-slate-600 font-medium leading-relaxed italic">{project?.description?.substring(0, 300)}...</p>
                    </div>
                    <div className="pt-6 border-t border-slate-50 space-y-4">
                       <Link href={`/dashboard/projects/${project?._id}`} target="_blank">
                          <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-100 font-black uppercase tracking-widest text-[9px] gap-2">
                             Ver Expediente Completo <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                       </Link>
                    </div>
                 </div>
              </div>

              <div className="bg-sky-50 rounded-[2.5rem] p-10 border border-sky-100 shadow-sm">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                       <AlertCircle className="h-5 w-5" />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-sky-800">Nota Institucional</h4>
                 </div>
                 <p className="text-xs text-sky-700/80 font-medium leading-relaxed">
                    Las evaluaciones por pares son confidenciales y se utilizan para la priorización institucional de recursos. Por favor sea exhaustivo y objetivo.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </main>
  )
}
