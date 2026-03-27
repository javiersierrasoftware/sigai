'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  MoreVertical,
  Calendar,
  Users,
  ChevronLeft,
  ArrowRight,
  ClipboardList,
  Target,
  BarChart3,
  Clock,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { updateProjectStatus } from "@/lib/actions/project-actions"

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

export default function AdminProjectsClient({ initialProjects }: Props) {
  const [projects, setProjects] = useState(initialProjects)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [loading, setLoading] = useState<string | null>(null)

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.principalInvestigator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    setLoading(projectId)
    const res = await updateProjectStatus(projectId, newStatus)
    if (res.success) {
      setProjects(projects.map(p => p._id === projectId ? { ...p, status: newStatus } : p))
    } else {
      alert(res.error)
    }
    setLoading(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 h-screen overflow-y-auto no-scrollbar pb-32">
      <div className="space-y-8 pb-10">
        
        {/* Admin Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-8">
          <div className="flex items-center gap-6">
             <Link href="/dashboard">
                <button className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                  <ChevronLeft className="h-5 w-5" />
                </button>
             </Link>
             <div>
                <div className="flex items-center gap-2 mb-0.5">
                   <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Administrativo DIUS</p>
                </div>
                <h1 className="text-3xl font-serif text-slate-800 tracking-tight leading-tight italic">Supervisión de Cartera Investigativa</h1>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carga Total</p>
                <p className="text-xl font-serif text-slate-800 italic">{projects.length} Proyectos</p>
             </div>
             <div className="h-10 w-0.5 bg-slate-100 mx-2" />
             <div className="text-right">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Pendientes</p>
                <p className="text-xl font-serif text-emerald-600 italic">
                   {projects.filter(p => p.status === 'SUBMITTED').length}
                </p>
             </div>
          </div>
        </div>

        {/* Master Filters */}
        <section className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 sticky top-0 z-40">
           <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input 
                 type="text" 
                 placeholder="BUSCAR POR TÍTULO O INVESTIGADOR..." 
                 className="w-full h-14 pl-14 pr-6 bg-slate-50/50 border-transparent rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2 px-2 overflow-x-auto custom-scrollbar-hide">
              {['TODOS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IN_EXECUTION'].map(status => (
                 <button 
                   key={status}
                   onClick={() => setStatusFilter(status)}
                   className={cn(
                    "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border mb-1",
                    statusFilter === status 
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" 
                      : "bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  )}
                 >
                    {status}
                 </button>
              ))}
           </div>
        </section>

        {/* Evaluation Tray - COMPACT MODE */}
        <div className="grid grid-cols-1 gap-4">
           {filteredProjects.map((project, idx) => (
              <motion.div 
                key={project._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 relative group"
              >
                 <div className="flex items-center gap-6">
                    
                    {/* Compact Icon */}
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                       <ClipboardList className="h-7 w-7" />
                    </div>

                    {/* Compact Metadata & Title */}
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                          <span className={cn(
                             "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border shadow-sm",
                             statusColors[project.status] || 'bg-slate-50'
                          )}>
                             {project.status}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">
                            {project.principalInvestigator}
                          </span>
                       </div>
                       
                       <h3 className="text-lg font-serif text-slate-800 tracking-tight leading-none group-hover:text-primary transition-colors truncate">
                          {project.title}
                       </h3>
                    </div>

                    {/* Integrated Horizontal Stats */}
                    <div className="hidden xl:flex items-center gap-8 px-6 border-x border-slate-50">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                             <BarChart3 className="h-3.5 w-3.5" />
                          </div>
                          <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Budget</p>
                             <p className="text-[12px] font-black text-slate-700">${(project.budget || 0).toLocaleString()}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center">
                             <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Inicio</p>
                             <p className="text-[12px] font-black text-slate-700">{new Date(project.startDate).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>

                    {/* Compact Actions Row */}
                    <div className="flex items-center gap-2">
                       <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-2">
                          {(project.status === 'SUBMITTED' || project.status === 'UNDER_REVIEW') && (
                            <Button 
                              onClick={() => handleStatusChange(project._id, 'APPROVED')}
                              disabled={loading === project._id}
                              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-black uppercase tracking-widest text-[8px] gap-2 border-0"
                            >
                               {loading === project._id ? '...' : <CheckCircle2 className="h-3.5 w-3.5" />}
                               <span className="hidden lg:inline">Aprobar</span>
                            </Button>
                          )}
                          {(project.status === 'SUBMITTED' || project.status === 'UNDER_REVIEW') && (
                            <Button 
                              onClick={() => handleStatusChange(project._id, 'REJECTED')}
                              disabled={loading === project._id}
                              variant="outline"
                              className="h-10 px-4 border-slate-200 bg-white text-rose-500 hover:bg-rose-50 rounded-xl font-black uppercase tracking-widest text-[8px] gap-2"
                            >
                               <XCircle className="h-3.5 w-3.5" />
                               <span className="hidden lg:inline">Cerrar</span>
                            </Button>
                          )}
                          {project.status === 'APPROVED' && (
                             <Button 
                               onClick={() => handleStatusChange(project._id, 'IN_EXECUTION')}
                               disabled={loading === project._id}
                               className="h-10 px-4 bg-primary hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[8px] gap-2 border-0"
                             >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Formalizar
                             </Button>
                          )}
                          
                          <Link href={`/dashboard/projects/${project._id}`}>
                            <Button variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-primary hover:bg-white rounded-xl">
                               <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                       </div>
                    </div>
                 </div>
              </motion.div>
           ))}

           {filteredProjects.length === 0 && (
              <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 border-dashed">
                 <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <ClipboardList className="h-10 w-10" />
                 </div>
                 <h3 className="text-xl font-serif text-slate-800 mb-2 italic">Sin proyectos radicados</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">La bandeja de supervisión se encuentra al día.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
