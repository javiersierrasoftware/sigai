'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Plus, 
  ChevronRight, 
  Search, 
  Settings2, 
  GraduationCap as GradIcon,
  LayoutGrid,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  createFaculty, 
  createAcademicProgram, 
  getProgramsByFaculty,
  updateAcademicProgram,
  deleteAcademicProgram
} from "@/lib/actions/admin-actions"
import { cn } from "@/lib/utils"

interface FacultyManagementProps {
  initialFaculties: any[]
}

export default function FacultyManagementClient({ initialFaculties }: FacultyManagementProps) {
  const [faculties, setFaculties] = useState(initialFaculties)
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddFaculty, setShowAddFaculty] = useState(false)
  const [showAddProgram, setShowAddProgram] = useState(false)
  const [editingProgram, setEditingProgram] = useState<any | null>(null)
  const [openProgramMenuId, setOpenProgramMenuId] = useState<string | null>(null)

  // ACTIONS
  async function handleAddFaculty(formData: FormData) {
    setLoading(true)
    const result = await createFaculty(formData)
    if (result.success) {
      setFaculties([...faculties, result.data])
      setShowAddFaculty(false)
    }
    setLoading(false)
  }

  async function handleProgramSubmit(formData: FormData) {
    setLoading(true)
    let result;
    if (editingProgram) {
      result = await updateAcademicProgram(editingProgram._id, formData)
    } else {
      result = await createAcademicProgram(formData)
    }

    if (result.success) {
      if (editingProgram) {
        setPrograms(programs.map(p => p._id === editingProgram._id ? result.data : p))
      } else {
        setPrograms([...programs, result.data])
      }
      closeProgramModal()
    }
    setLoading(false)
  }

  async function handleDeleteProgram(id: string) {
    if (!confirm('¿Seguro que desea eliminar este programa?')) return
    setLoading(true)
    const result = await deleteAcademicProgram(id)
    if (result.success) {
      setPrograms(programs.filter(p => p._id !== id))
    }
    setLoading(false)
    setOpenProgramMenuId(null)
  }

  const openProgramEdit = (program: any) => {
    setEditingProgram(program)
    setShowAddProgram(true)
    setOpenProgramMenuId(null)
  }

  const closeProgramModal = () => {
    setShowAddProgram(false)
    setEditingProgram(null)
  }

  async function selectFaculty(faculty: any) {
    setSelectedFaculty(faculty)
    setLoading(true)
    const result = await getProgramsByFaculty(faculty._id)
    if (result.success) {
      setPrograms(result.data)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">
             <button onClick={() => window.history.back()} className="hover:text-primary transition-colors flex items-center gap-1">
                <ChevronLeft className="h-3 w-3" /> Dashboard
             </button>
             <span>/</span>
             <span className="text-primary">Gestión de Facultades</span>
          </div>
          <h1 className="text-4xl font-serif text-slate-800">Facultades y Programas</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest leading-relaxed">
            Estructura institucional de la Universidad de Sucre
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAddFaculty(true)}
          className="h-14 px-8 bg-primary hover:bg-primary/95 text-white shadow-xl shadow-emerald-200/50 transition-all duration-300 font-bold uppercase tracking-widest text-xs rounded-2xl group"
        >
          <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" /> 
          Nueva Facultad
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDE BAR: Faculty List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-6">
            <div className="relative mb-6">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
               <input 
                 type="text" 
                 placeholder="Buscar facultad..."
                 className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium"
               />
            </div>

            <div className="space-y-2">
              {faculties.map((faculty) => (
                <button
                  key={faculty._id}
                  onClick={() => selectFaculty(faculty)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group text-left",
                    selectedFaculty?._id === faculty._id
                      ? "bg-primary text-white border-primary shadow-lg shadow-emerald-200/40"
                      : "bg-white border-slate-50 text-slate-600 hover:border-primary/20 hover:bg-slate-50/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-colors font-bold text-xs",
                      selectedFaculty?._id === faculty._id ? "bg-white/20" : "bg-slate-100"
                    )}>
                      {faculty.code}
                    </div>
                    <span className="font-serif text-sm tracking-tight">{faculty.name}</span>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform group-hover:translate-x-1",
                    selectedFaculty?._id === faculty._id ? "text-white/50" : "text-slate-300"
                  )} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN: Programs View */}
        <div className="lg:col-span-8">
           {selectedFaculty ? (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-6"
             >
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                   <div className="bg-slate-50/20 px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                            <Building2 className="h-7 w-7" />
                         </div>
                         <div>
                            <h2 className="text-2xl font-serif text-slate-800 leading-tight">{selectedFaculty.name}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Cód. Institucional: {selectedFaculty.code}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-slate-600"><Edit2 className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                   </div>

                   <div className="p-10">
                      <div className="flex items-center justify-between mb-8">
                         <h3 className="font-serif text-slate-700 flex items-center gap-3 text-lg leading-none">
                            <BookOpen className="h-5 w-5 text-primary/60" />
                            Programas Académicos
                         </h3>
                         <Button 
                           onClick={() => setShowAddProgram(true)}
                           variant="outline" 
                           size="sm" 
                           className="text-[10px] font-bold uppercase tracking-[0.2em] border-slate-200 text-slate-500 hover:text-primary hover:border-primary/20 rounded-xl px-4 h-9"
                         >
                            <Plus className="mr-2 h-3.5 w-3.5" /> Agregar
                         </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {programs.length > 0 ? programs.map((program) => (
                            <div key={program._id} className="p-6 rounded-3xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-500 group relative">
                               <div className="flex items-center justify-between mb-4">
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary/70 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                                     {program.level}
                                  </span>
                                  
                                  {/* DROPDOWN MENU FOR PROGRAMS */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setOpenProgramMenuId(openProgramMenuId === program._id ? null : program._id)}
                                      className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-slate-200 hover:text-primary hover:bg-primary/5 transition-all"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </button>
                                    
                                    <AnimatePresence>
                                      {openProgramMenuId === program._id && (
                                        <>
                                          <div className="fixed inset-0 z-10" onClick={() => setOpenProgramMenuId(null)} />
                                          <motion.div 
                                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                            className="absolute right-0 top-10 w-36 bg-white rounded-xl shadow-xl border border-slate-50 p-1.5 z-20"
                                          >
                                             <button onClick={() => openProgramEdit(program)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 transition-colors">
                                                <Edit2 className="h-3.5 w-3.5 text-primary" /> Editar
                                             </button>
                                             <button onClick={() => handleDeleteProgram(program._id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg text-xs font-bold text-red-500 transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                             </button>
                                          </motion.div>
                                        </>
                                      )}
                                    </AnimatePresence>
                                  </div>
                               </div>
                               <h4 className="font-serif text-slate-700 text-sm group-hover:text-primary transition-colors">{program.name}</h4>
                               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Cód: {program.code}</p>
                            </div>
                         )) : (
                            <div className="col-span-2 flex flex-col items-center justify-center py-20 bg-slate-50/20 rounded-[2rem] border border-dashed border-slate-200">
                               <LayoutGrid className="h-10 w-10 text-slate-100 mb-4" />
                               <p className="text-sm font-medium text-slate-300">No hay programas registrados aún.</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
             </motion.div>
           ) : (
             <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dotted border-slate-200 p-12 text-center opacity-60">
                <Building2 className="h-20 w-20 text-slate-100 mb-6" />
                <h3 className="text-2xl font-serif text-slate-300 italic mb-2">Seleccione una facultad</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-200 max-w-xs leading-relaxed">
                   Elija una facultad del listado lateral para gestionar sus programas académicos.
                </p>
             </div>
           )}
        </div>
      </div>

      {/* MODAL: ADD/EDIT FACULTY */}
      <AnimatePresence>
        {showAddFaculty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl"
            >
               <h3 className="text-3xl font-serif text-slate-800 mb-2">Nueva Facultad</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Información Institucional</p>
               
               <form action={handleAddFaculty} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre</label>
                    <input type="text" name="name" required placeholder="Facultad de Ingeniería" className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Código (Cód. Facultad)</label>
                    <input type="text" name="code" required placeholder="FI" className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={() => setShowAddFaculty(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Cancelar</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-14 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-200/50">
                       {loading ? 'Creando...' : 'Crear Facultad'}
                    </Button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}

        {/* MODAL: ADD/EDIT PROGRAM */}
        {showAddProgram && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl"
            >
               <h3 className="text-3xl font-serif text-slate-800 mb-2">{editingProgram ? 'Editar' : 'Nuevo'} Programa</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Asociado a {selectedFaculty?.name}</p>
               
               <form action={handleProgramSubmit} className="space-y-6">
                  <input type="hidden" name="facultyId" value={selectedFaculty?._id} />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre del Programa</label>
                    <input type="text" name="name" required defaultValue={editingProgram?.name} placeholder="Ingeniería de Sistemas" className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Código</label>
                      <input type="text" name="code" required defaultValue={editingProgram?.code} placeholder="ISI" className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nivel</label>
                      <select name="level" defaultValue={editingProgram?.level || 'PREGRADO'} className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs appearance-none cursor-pointer font-medium">
                        <option value="PREGRADO">Pregrado</option>
                        <option value="POSGRADO">Especialización</option>
                        <option value="MAESTRIA">Maestría</option>
                        <option value="DOCTORADO">Doctorado</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={closeProgramModal} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Cancelar</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-14 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-200/50">
                       {loading ? 'Guardando...' : (editingProgram ? 'Actualizar' : 'Crear Programa')}
                    </Button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
