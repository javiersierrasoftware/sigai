'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  User,
  Save,
  Edit2,
  X,
  Search,
  Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { createLecturer, updateLecturer, deleteLecturer } from "@/lib/actions/lecturer-actions"

interface Props {
  initialLecturers: any[]
  user: any
  faculties: any[]
  programs: any[]
}

export default function LecturersManagementClient({ initialLecturers, user, faculties, programs }: Props) {
  const [lecturers, setLecturers] = useState(initialLecturers)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [identification, setIdentification] = useState('')
  const [contractType, setContractType] = useState('PLANTA')
  const [email, setEmail] = useState('')
  
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')
  
  // Edit mode states
  const [editingId, setEditingId] = useState<string | null>(null)

  const filteredPrograms = useMemo(() => {
    return programs.filter(p => p.faculty === selectedFacultyId || (p.faculty as any)?._id === selectedFacultyId)
  }, [selectedFacultyId, programs])

  const handleAdd = async () => {
    if (!fullName || !identification) {
      alert("Por favor ingrese el nombre y la identificación.");
      return;
    }
    setLoading(true)
    if (editingId) {
      const res = await updateLecturer(editingId, { 
        fullName, 
        identification, 
        contractType, 
        email: email || undefined,
        facultyId: selectedFacultyId,
        programId: selectedProgramId
      })
      if (res.success) {
        // Map data from response (ensure populated values exist)
        const updatedDoc = res.data;
        const matchingFaculty = faculties.find(f => f._id === selectedFacultyId);
        const matchingProgram = programs.find(p => p._id === selectedProgramId);
        if (updatedDoc.profile) {
          updatedDoc.profile.faculty = matchingFaculty || selectedFacultyId;
          updatedDoc.profile.program = matchingProgram || selectedProgramId;
        }
        setLecturers(lecturers.map(l => l._id === editingId ? updatedDoc : l))
        handleCancelEdit()
      } else {
        alert("Error: " + res.error)
      }
    } else {
      const res = await createLecturer({ 
        fullName, 
        identification, 
        contractType, 
        email: email || undefined,
        facultyId: selectedFacultyId,
        programId: selectedProgramId
      })
      if (res.success) {
        const newDoc = res.data;
        const matchingFaculty = faculties.find(f => f._id === selectedFacultyId);
        const matchingProgram = programs.find(p => p._id === selectedProgramId);
        if (newDoc.profile) {
          newDoc.profile.faculty = matchingFaculty || selectedFacultyId;
          newDoc.profile.program = matchingProgram || selectedProgramId;
        }
        setLecturers([newDoc, ...lecturers])
        handleCancelEdit()
      } else {
        alert("Error: " + res.error)
      }
    }
    setLoading(false)
  }

  const handleEdit = (lecturer: any) => {
    setEditingId(lecturer._id)
    setFullName(lecturer.fullName)
    setIdentification(lecturer.identification)
    setContractType(lecturer.profile?.contractType || 'PLANTA')
    setSelectedFacultyId(lecturer.profile?.faculty?._id || lecturer.profile?.faculty || '')
    setSelectedProgramId(lecturer.profile?.program?._id || lecturer.profile?.program || '')
    setEmail(lecturer.email || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFullName('')
    setIdentification('')
    setContractType('PLANTA')
    setSelectedFacultyId('')
    setSelectedProgramId('')
    setEmail('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desea eliminar este docente?")) return;
    const res = await deleteLecturer(id)
    if (res.success) {
      setLecturers(lecturers.filter(l => l._id !== id))
    } else {
      alert("Error: " + res.error)
    }
  }

  // Filter lecturers by name or ID
  const filteredLecturers = useMemo(() => {
    return lecturers.filter(l => {
      const nameMatch = l.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      const idMatch = l.identification.includes(searchTerm)
      return nameMatch || idMatch
    })
  }, [lecturers, searchTerm])

  const getContractBadgeStyles = (type: string) => {
    switch (type) {
      case 'PLANTA':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'CONTRATO':
        return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'OCASIONAL':
        return 'bg-purple-50 text-purple-600 border-purple-100'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  const getContractLabel = (type: string) => {
    switch (type) {
      case 'PLANTA':
        return 'Planta'
      case 'CONTRATO':
        return 'Contrato'
      case 'OCASIONAL':
        return 'Ocasional'
      default:
        return type || 'No Definido'
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
              <h1 className="text-3xl font-serif text-slate-800 tracking-tight">Gestión de Docentes</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Vinculación, identificaciones y accesos de la plataforma</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Lado Izquierdo: Formulario */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm sticky top-40">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-slate-800">
                  {editingId ? 'Editar Docente' : 'Nuevo Docente'}
                </h2>
                {editingId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancelEdit}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500"
                  >
                    Cancelar <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombres y Apellidos</label>
                    <input 
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                      placeholder="Ej: John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identificación (C.C)</label>
                    <input 
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                      placeholder="Ej: 12345678"
                      value={identification}
                      onChange={(e) => setIdentification(e.target.value)}
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facultad de Aval</label>
                    <select 
                      value={selectedFacultyId} 
                      onChange={(e) => {
                        setSelectedFacultyId(e.target.value)
                        setSelectedProgramId('')
                      }}
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit cursor-pointer appearance-none text-xs"
                    >
                       <option value="">Seleccione Facultad...</option>
                       {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Programa Académico</label>
                    <select 
                      value={selectedProgramId} 
                      onChange={(e) => setSelectedProgramId(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit cursor-pointer appearance-none text-xs"
                    >
                       <option value="">Seleccione Programa...</option>
                       {filteredPrograms.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Vinculación</label>
                    <select 
                      value={contractType} 
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit cursor-pointer appearance-none"
                    >
                       <option value="PLANTA">Docente de Planta</option>
                       <option value="CONTRATO">Docente de Contrato</option>
                       <option value="OCASIONAL">Docente Ocasional</option>
                    </select>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico (Opcional)</label>
                    <input 
                      type="email"
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                      placeholder="Ej: jdoe@unisucre.edu.co"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>

                 <div className="pt-4">
                    <Button 
                      onClick={handleAdd}
                      disabled={loading || !fullName || !identification}
                      className="w-full h-16 bg-primary text-white rounded-2xl shadow-xl shadow-emerald-100 font-bold uppercase tracking-widest text-[11px]"
                    >
                      {loading ? "Procesando..." : (editingId ? "Actualizar Docente" : "Registrar Docente")} 
                      {editingId ? <Save className="ml-2 h-4 w-4" /> : <Plus className="ml-2 h-4 w-4" />}
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        {/* Lado Derecho: Listado */}
        <div className="lg:col-span-8 space-y-6">
           {/* Barra de Búsqueda */}
           <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm flex items-center gap-4">
              <Search className="h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar docente por nombre o identificación..." 
                className="w-full bg-transparent border-none text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300 font-outfit"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                 {filteredLecturers.length} Docentes
              </span>
           </div>

           <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredLecturers.map((lecturer) => (
                 <div key={lecturer._id} className="p-8 rounded-[2.5rem] bg-white border border-slate-50 hover:shadow-lg hover:shadow-slate-100 transition-all flex items-center justify-between overflow-hidden relative group">
                    <div className="flex items-center gap-6">
                       <div className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-serif text-xl border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {lecturer.fullName.charAt(0)}
                       </div>
                       <div>
                           <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-xl font-serif text-slate-800">{lecturer.fullName}</h3>
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                getContractBadgeStyles(lecturer.profile?.contractType)
                              )}>
                                 {getContractLabel(lecturer.profile?.contractType)}
                              </span>
                              {lecturer.profile?.program?.name && (
                                <span className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-100 rounded-lg text-[8px] font-bold uppercase tracking-wider">
                                   {lecturer.profile?.program?.name}
                                </span>
                              )}
                           </div>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                             <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                ID: <strong className="text-slate-600 font-bold">{lecturer.identification}</strong>
                             </span>
                             <div className="h-1 w-1 rounded-full bg-slate-200" />
                             <span className="text-slate-400 text-[9px] font-medium uppercase tracking-widest flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5" /> 
                                {lecturer.email ? (
                                  <span className="text-slate-600 font-bold lowercase">{lecturer.email}</span>
                                ) : (
                                  <span className="text-rose-400 font-black italic tracking-wide">Sin correo registrado</span>
                                )}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                       <button 
                         onClick={() => handleEdit(lecturer)}
                         className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                       >
                          <Edit2 className="h-4 w-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(lecturer._id)}
                         className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                       >
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                 </div>
              ))}

              {filteredLecturers.length === 0 && (
                 <div className="bg-white rounded-[3rem] p-24 text-center flex flex-col items-center gap-4 border border-slate-50 shadow-sm">
                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                       <User className="h-8 w-8" />
                    </div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No se encontraron docentes</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </main>
  )
}
