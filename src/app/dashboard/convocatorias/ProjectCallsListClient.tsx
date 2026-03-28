'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  Filter,
  DollarSign,
  Users,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Props {
  initialCalls: any[]
}

export default function ProjectCallsListClient({ initialCalls }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const filteredCalls = initialCalls.filter(call => 
    call.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: string) => {
    if (!mounted) return '---'
    try {
      return new Date(date).toLocaleDateString()
    } catch {
      return '---'
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8 pb-10">
        {/* Page Content Header */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-slate-800">Convocatorias Vigentes</h1>
            <p className="text-slate-400 mt-1 max-w-2xl leading-relaxed text-[11px] uppercase tracking-widest font-medium">
              Gestione su producción investigativa con excelencia institucional.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group shadow-sm rounded-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="BUSCAR CONVOCATORIA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 pl-12 pr-6 bg-white border border-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all w-64"
                />
             </div>
             <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-100 text-slate-400 p-0 hover:text-emerald-500">
                <Filter className="h-5 w-5" />
             </Button>
          </div>
        </div>

        {/* Content Section - Grid matches Dashboard style cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalls.map((call, idx) => (
            <motion.div
              key={call._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1"
            >
              {/* Call Status Badge */}
              <div className="absolute top-6 right-6">
                 <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100/50 shadow-sm flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Abierta
                 </div>
              </div>

              <div className="flex flex-col h-full pt-4">
                 <div className="mb-6 flex items-start">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 transition-all duration-500 shadow-sm">
                       <ClipboardList className="h-7 w-7" />
                    </div>
                 </div>

                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{call.code}</p>
                 <h3 className="text-xl font-serif text-slate-800 mb-6 group-hover:text-emerald-600 transition-colors leading-tight line-clamp-2 min-h-[3rem]">
                   {call.title}
                 </h3>

                 <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Calendar className="h-3.5 w-3.5" /> Apertura
                       </div>
                       <span className="text-[10px] font-bold text-slate-700">{formatDate(call.openingDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3 text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                          <Clock className="h-3.5 w-3.5" /> Cierre
                       </div>
                       <span className="text-[10px] font-bold text-slate-700">{formatDate(call.closingDate)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                       <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <Users className="h-3.5 w-3.5" /> Dirigido a
                       </div>
                       <span className="text-[10px] font-bold text-emerald-600">{call.targetAudience}</span>
                    </div>
                 </div>

                 <div className="mt-auto">
                    <Link href={`/dashboard/convocatorias/postular/${call._id}`}>
                      <Button className="w-full h-14 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] group/btn transition-all shadow-xl shadow-slate-200 hover:shadow-emerald-200/50">
                         Realizar Postulación
                         <ArrowRight className="ml-3 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                 </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -right-6 -bottom-6 opacity-[0.02] rotate-12 group-hover:scale-110 transition-transform duration-1000">
                 <ClipboardList className="h-32 w-32" />
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCalls.length === 0 && (
           <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                 <Search className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-serif text-slate-800 mb-2">No se encontraron convocatorias</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto font-medium tracking-widest uppercase">Intente ajustar los filtros de búsqueda o regrese más tarde.</p>
           </div>
        )}
      </div>
    </div>
  )
}
