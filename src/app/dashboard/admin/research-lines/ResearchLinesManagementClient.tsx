'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  ChevronLeft,
  Trash2,
  Edit2,
  TrendingUp,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createResearchLine, updateResearchLine, deleteResearchLine } from "@/lib/actions/admin-actions"
import { cn } from "@/lib/utils"

interface Props {
  initialLines: any[]
}

export default function ResearchLinesManagementClient({ initialLines }: Props) {
  const [lines, setLines] = useState(initialLines)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingLine, setEditingLine] = useState<any | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    let result;
    if (editingLine) {
      result = await updateResearchLine(editingLine._id, formData)
    } else {
      result = await createResearchLine(formData)
    }

    if (result.success) {
      if (editingLine) {
        setLines(lines.map(l => l._id === editingLine._id ? result.data : l))
      } else {
        setLines([...lines, result.data])
      }
      closeModal()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que desea eliminar esta línea?')) return
    setLoading(true)
    const result = await deleteResearchLine(id)
    if (result.success) {
      setLines(lines.filter(l => l._id !== id))
    }
    setLoading(false)
    setOpenMenuId(null)
  }

  const openEdit = (line: any) => {
    setEditingLine(line)
    setShowModal(true)
    setOpenMenuId(null)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingLine(null)
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
             <span className="text-primary">Líneas de Investigación</span>
          </div>
          <h1 className="text-4xl font-serif text-slate-800">Líneas Institucionales</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">
            Ejes estratégicos de desarrollo científico Unisucre
          </p>
        </div>
        
        <Button 
          onClick={() => setShowModal(true)}
          className="h-14 px-8 bg-primary hover:bg-primary/95 text-white shadow-xl shadow-emerald-200/50 transition-all duration-300 font-bold uppercase tracking-widest text-xs rounded-2xl group"
        >
          <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" /> 
          Nueva Línea
        </Button>
      </div>

      {/* Lines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lines.map((line) => (
          <div key={line._id} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group relative">
             <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                   <TrendingUp className="h-6 w-6" />
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === line._id ? null : line._id)}
                    className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                     <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  <AnimatePresence>
                    {openMenuId === line._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className="absolute right-0 top-12 w-40 bg-white rounded-2xl shadow-xl border border-slate-50 p-2 z-20"
                        >
                           <button onClick={() => openEdit(line)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors">
                              <Edit2 className="h-4 w-4 text-primary" /> Editar
                           </button>
                           <button onClick={() => handleDelete(line._id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 rounded-xl text-xs font-bold text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" /> Eliminar
                           </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
             </div>

             <h3 className="text-xl font-serif text-slate-800 mb-3 group-hover:text-primary transition-colors leading-tight">
                {line.name}
             </h3>
             <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {line.description || 'Sin descripción institucional.'}
             </p>
          </div>
        ))}

        {lines.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 opacity-50 text-center">
             <TrendingUp className="h-12 w-12 text-slate-100 mb-4" />
             <p className="text-sm font-medium text-slate-300">No hay líneas registradas aún.</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD/EDIT LINE */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl"
            >
               <h3 className="text-3xl font-serif text-slate-800 mb-2">{editingLine ? 'Editar' : 'Nueva'} Línea</h3>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Eje Estratégico</p>
               
               <form action={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre de la Línea</label>
                    <input type="text" name="name" required defaultValue={editingLine?.name} placeholder="Salud Pública y Tropical" className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Descripción</label>
                    <textarea name="description" defaultValue={editingLine?.description} rows={4} placeholder="Descripción breve de los objetivos de esta línea..." className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium resize-none" />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={closeModal} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Cancelar</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-14 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-200/50">
                       {loading ? 'Guardando...' : (editingLine ? 'Actualizar' : 'Crear Línea')}
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
