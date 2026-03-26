'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Plus,
  ChevronRight,
  Search,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit2,
  Globe,
  User as UserIcon,
  Phone,
  Tag,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createResearchGroup, updateResearchGroup, deleteResearchGroup } from "@/lib/actions/admin-actions"
import { cn } from "@/lib/utils"

interface Props {
  initialGroups: any[]
  allPrograms: any[]
}

export default function ResearchGroupManagementClient({ initialGroups, allPrograms }: Props) {
  const [groups, setGroups] = useState(initialGroups)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any | null>(null)
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // ACTIONS
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    formData.append('academicPrograms', JSON.stringify(selectedPrograms))

    let result;
    if (editingGroup) {
      result = await updateResearchGroup(editingGroup._id, formData)
    } else {
      result = await createResearchGroup(formData)
    }

    if (result.success) {
      if (editingGroup) {
        setGroups(groups.map(g => g._id === editingGroup._id ? result.data : g))
      } else {
        setGroups([...groups, result.data])
      }
      closeModal()
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que desea eliminar este grupo?')) return
    setLoading(true)
    const result = await deleteResearchGroup(id)
    if (result.success) {
      setGroups(groups.filter(g => g._id !== id))
    }
    setLoading(false)
    setOpenMenuId(null)
  }

  const openEdit = (group: any) => {
    setEditingGroup(group)
    setSelectedPrograms(group.academicPrograms?.map((p: any) => p._id || p) || [])
    setShowModal(true)
    setOpenMenuId(null)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingGroup(null)
    setSelectedPrograms([])
  }

  const toggleProgram = (id: string) => {
    setSelectedPrograms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
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
            <span className="text-primary">Grupos de Investigación</span>
          </div>
          <h1 className="text-4xl font-serif text-slate-800">Grupos de Investigación</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest leading-relaxed">
            Gestión de agrupaciones científicas y categorización Minciencias
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="h-14 px-8 bg-primary hover:bg-primary/95 text-white shadow-xl shadow-emerald-200/50 transition-all duration-300 font-bold uppercase tracking-widest text-xs rounded-2xl group"
        >
          <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" />
          Nuevo Grupo
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group._id} className="bg-white rounded-[2.5rem] border border-slate-100/50 shadow-sm p-6 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group relative">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                group.category === 'A1' ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm" :
                  group.category === 'A' ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm" :
                    "bg-slate-50 text-slate-400 border-slate-100"
              )}>
                Categoría {group.category}
              </div>

              {/* MENU 3 DOTS */}
              <div className="relative">
                <button
                  onClick={() => setOpenMenuId(openMenuId === group._id ? null : group._id)}
                  className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {openMenuId === group._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute right-0 top-12 w-40 bg-white rounded-2xl shadow-xl border border-slate-50 p-2 z-20"
                      >
                        <button onClick={() => openEdit(group)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors">
                          <Edit2 className="h-4 w-4 text-primary" /> Editar
                        </button>
                        <button onClick={() => handleDelete(group._id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 rounded-xl text-xs font-bold text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <h3 className="text-lg font-serif text-slate-800 mb-3 group-hover:text-primary transition-colors h-12 line-clamp-2 leading-snug">
              {group.name}
            </h3>

            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <UserIcon className="h-3.5 w-3.5 text-slate-300" />
                {group.leaderName}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <Globe className="h-3.5 w-3.5 text-slate-200" />
                <a href={group.gruplacUrl} target="_blank" className="hover:text-primary truncate transition-colors">Ver GrupLAC</a>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
              <div className="flex -space-x-2">
                {group.academicPrograms?.slice(0, 3).map((p: any, idx: number) => (
                  <div key={idx} className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase" title={p.name}>
                    {p.code}
                  </div>
                ))}
                {group.academicPrograms?.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-300">
                    +{group.academicPrograms.length - 3}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl">
                Expediente <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD/EDIT GROUP */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl my-8"
            >
              <h3 className="text-3xl font-serif text-slate-800 mb-2">{editingGroup ? 'Editar' : 'Nuevo'} Grupo de Investigación</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">Convocatoria Minciencias</p>

              <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre del Grupo</label>
                  <input type="text" name="name" required defaultValue={editingGroup?.name} placeholder="G.I. en Inteligencia Artificial y Datos" className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Categoría Minciencias</label>
                  <select name="category" defaultValue={editingGroup?.category || 'NC'} className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs appearance-none cursor-pointer font-medium">
                    <option value="A1">A1</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="NC">No categorizado</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">URL GrupLAC</label>
                  <input type="url" name="gruplacUrl" defaultValue={editingGroup?.gruplacUrl} placeholder="https://scienti.minciencias.gov.co/gruplac/..." className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Líder del Grupo</label>
                  <input type="text" name="leaderName" required defaultValue={editingGroup?.leaderName} placeholder="Nombre completo del líder" className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email del Líder</label>
                  <input type="email" name="leaderEmail" required defaultValue={editingGroup?.leaderEmail} placeholder="ejemplo@unisucre.edu.co" className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Teléfono Profesional</label>
                  <input type="tel" name="leaderPhone" required defaultValue={editingGroup?.leaderPhone} placeholder="+57 300..." className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Programas a los que aporta</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {allPrograms.map((program) => (
                      <button
                        key={program._id}
                        type="button"
                        onClick={() => toggleProgram(program._id)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                          selectedPrograms.includes(program._id)
                            ? "bg-primary/5 border-primary/20 text-primary"
                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                        )}
                      >
                        <span className="text-[10px] font-medium truncate pr-2">{program.name}</span>
                        {selectedPrograms.includes(program._id) && <Check className="h-3 w-3 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-4 pt-6">
                  <Button type="button" onClick={closeModal} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Cancelar</Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-14 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-200/50">
                    {loading ? 'Guardando...' : (editingGroup ? 'Actualizar Grupo' : 'Registrar Grupo')}
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
