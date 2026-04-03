'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Calendar,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { createAcademicPeriod, updateAcademicPeriod, deleteAcademicPeriod } from "@/lib/actions/academic-period-actions"

interface Props {
  initialPeriods: any[]
  user: any
}

export default function AcademicPeriodsClient({ initialPeriods, user }: Props) {
  const [periods, setPeriods] = useState(initialPeriods)
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')

  const handleAdd = async () => {
    if (!newName) return;
    setLoading(true)
    const res = await createAcademicPeriod({ name: newName, status: 'OPEN', isCurrent: periods.length === 0 })
    if (res.success) {
      setPeriods([res.data, ...periods])
      setNewName('')
    } else {
      alert("Error: " + res.error)
    }
    setLoading(false)
  }

  const toggleStatus = async (period: any) => {
    const newStatus = period.status === 'OPEN' ? 'CLOSED' : 'OPEN'
    const res = await updateAcademicPeriod(period._id, { status: newStatus })
    if (res.success) {
      setPeriods(periods.map(p => p._id === period._id ? res.data : p))
    }
  }

  const setAsCurrent = async (period: any) => {
    const res = await updateAcademicPeriod(period._id, { isCurrent: true })
    if (res.success) {
      // Need to refresh all because other isCurrents were unset in server
      setPeriods(periods.map(p => {
          if (p._id === period._id) return { ...p, isCurrent: true };
          return { ...p, isCurrent: false };
      }))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desea eliminar este periodo?")) return;
    const res = await deleteAcademicPeriod(id)
    if (res.success) {
      setPeriods(periods.filter(p => p._id !== id))
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-outfit">
      <div className="bg-white border-b border-slate-100 px-8 py-10 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary transition-all">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-slate-800 tracking-tight">Gestión de Periodos Académicos</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Control temporal de radicaciones y vigencias</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 mt-12 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Lado Izquierdo: Formulario */}
        <div className="md:col-span-5 space-y-8">
           <div className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm sticky top-40">
              <h2 className="text-2xl font-serif text-slate-800 mb-8">Nuevo Periodo</h2>
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificador del Periodo</label>
                    <input 
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                      placeholder="Ej: 2026-1"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                 </div>
                 <div className="pt-4">
                    <Button 
                      onClick={handleAdd}
                      disabled={loading || !newName}
                      className="w-full h-16 bg-primary text-white rounded-2xl shadow-xl shadow-emerald-100 font-bold uppercase tracking-widest text-[11px]"
                    >
                      {loading ? "Creando..." : "Habilitar Periodo"} <Plus className="ml-2 h-4 w-4" />
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        {/* Lado Derecho: Listado */}
        <div className="md:col-span-7 space-y-4">
           {periods.map((period) => (
              <div key={period._id} className={cn(
                "p-8 rounded-[2.5rem] bg-white border transition-all flex items-center justify-between overflow-hidden relative group",
                period.isCurrent ? "border-primary shadow-lg shadow-emerald-50" : "border-slate-50"
              )}>
                 <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                      period.isCurrent ? "bg-primary text-white" : "bg-slate-50 text-slate-400"
                    )}>
                       <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                       <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-serif text-slate-800">{period.name}</h3>
                          {period.isCurrent && (
                              <span className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg">ACTUAL</span>
                          )}
                       </div>
                       <div className="flex items-center gap-4 mt-2">
                          <button 
                            onClick={() => toggleStatus(period)}
                            className={cn(
                              "flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all",
                              period.status === 'OPEN' ? "text-emerald-500" : "text-rose-500"
                            )}
                          >
                             {period.status === 'OPEN' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                             {period.status === 'OPEN' ? 'Periodo Abierto' : 'Periodo Cerrado'}
                          </button>
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                          <span className="text-slate-400 text-[9px] font-medium uppercase tracking-widest flex items-center gap-2">
                             <Clock className="h-3 w-3" /> {new Date(period.createdAt).toLocaleDateString()}
                          </span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 relative z-10">
                    {!period.isCurrent && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setAsCurrent(period)}
                          className="h-10 px-4 rounded-xl text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5"
                        >
                          Marcar Actual
                        </Button>
                    )}
                    <button 
                      onClick={() => handleDelete(period._id)}
                      className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                    >
                       <Trash2 className="h-4 w-4" />
                    </button>
                 </div>

                 {period.isCurrent && (
                     <div className="absolute top-0 right-0 p-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                     </div>
                 )}
              </div>
           ))}

           {periods.length === 0 && (
              <div className="bg-white rounded-[3rem] p-24 text-center flex flex-col items-center gap-4 border border-slate-50 shadow-sm">
                 <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <Settings className="h-8 w-8" />
                 </div>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No hay periodos creados</p>
              </div>
           )}
        </div>
      </div>
    </main>
  )
}
