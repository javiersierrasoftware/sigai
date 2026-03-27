'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ChevronLeft,
  FileText,
  Trash2,
  ChevronRight,
  ClipboardList,
  Check,
  Edit2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createRubric } from "@/lib/actions/admin-actions"
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  initialRubrics: any[]
}

export default function RubricManagementClient({ initialRubrics }: Props) {
  const [rubrics, setRubrics] = useState(initialRubrics)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [criteria, setCriteria] = useState<{name: string, instruction: string, maxScore: number, commentsEnabled: boolean}[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')

  const openNew = () => {
    setEditingId(null)
    setFormName('')
    setFormDescription('')
    setCriteria([])
    setShowModal(true)
  }

  const handleEdit = (rubric: any) => {
    setEditingId(rubric._id)
    setFormName(rubric.name)
    setFormDescription(rubric.description || '')
    setCriteria(rubric.criteria)
    setShowModal(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que desea eliminar esta rúbrica?')) return;
    const { deleteRubric } = await import("@/lib/actions/admin-actions");
    const res = await deleteRubric(id);
    if (res.success) {
      setRubrics(rubrics.filter(r => r._id !== id));
    }
  }

  async function handleSubmit(formData: FormData) {
    if (criteria.length === 0) return alert('Debe agregar al menos un criterio');
    setLoading(true)
    formData.append('criteria', JSON.stringify(criteria.map(c => ({ ...c, commentMaxLength: 1500 }))))
    
    const { createRubric, updateRubric } = await import("@/lib/actions/admin-actions");

    const res = editingId 
      ? await updateRubric(editingId, formData)
      : await createRubric(formData);

    if (res.success) {
      if (editingId) {
        setRubrics(rubrics.map(r => r._id === editingId ? res.data : r));
      } else {
        setRubrics([res.data, ...rubrics]);
      }
      setShowModal(false);
      setEditingId(null);
    } else {
      alert(res.error);
    }
    setLoading(false)
  }

  const addCriterion = () => {
    setCriteria([...criteria, { name: '', instruction: '', maxScore: 10, commentsEnabled: true }]);
  }

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  }

  const updateCriterion = (index: number, field: string, value: any) => {
    const newCriteria = [...criteria];
    (newCriteria[index] as any)[field] = value;
    setCriteria(newCriteria);
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
            <span className="text-primary">Rúbricas de Evaluación</span>
          </div>
          <h1 className="text-4xl font-serif text-slate-800">Rúbricas</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest leading-relaxed">
            Configure las matrices de evaluación institucional para proyectos.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <Link href="/dashboard/admin/calls" className="hidden sm:block">
              <Button variant="outline" className="h-14 rounded-2xl border-slate-200 text-slate-400 px-6 font-bold uppercase tracking-widest text-[10px]">
                 Ver Convocatorias
              </Button>
           </Link>

           <Button
             onClick={openNew}
             className="h-14 px-8 bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose- Rose-200/50 transition-all duration-300 font-bold uppercase tracking-widest text-xs rounded-2xl group"
           >
             <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" />
             Nueva Rúbrica
           </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {rubrics.map((rubric) => (
            <div key={rubric._id} className="bg-white rounded-[2.5rem] border border-slate-100/50 shadow-sm p-8 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group relative overflow-hidden">
               <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                     <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleEdit(rubric)} className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                        <Edit2 className="h-4 w-4" />
                     </button>
                     <button onClick={() => handleDelete(rubric._id)} className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
               </div>

               <h3 className="text-xl font-serif text-slate-800 mb-2 group-hover:text-rose-500 transition-colors uppercase tracking-tight">
                 {rubric.name}
               </h3>
               <p className="text-xs text-slate-400 mb-6 line-clamp-2 italic">{rubric.description || 'Sin descripción'}</p>
               
               <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                     {rubric.criteria.length} Criterios Evaluativos
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
               </div>

               <div className="absolute -right-4 -bottom-4 opacity-[0.02] rotate-12 group-hover:scale-110 transition-transform duration-500">
                 <ClipboardList className="h-24 w-24 text-rose-500" />
               </div>
            </div>
         ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl p-10 shadow-2xl my-8 relative"
            >
              <h3 className="text-3xl font-serif text-slate-800 mb-2">{editingId ? 'Editar Rúbrica' : 'Crear Rúbrica'}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 italic">{editingId ? 'Modificando matriz institucional' : 'Definición de matriz evaluativa institucional'}</p>

              <form action={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre de la Rúbrica</label>
                    <input 
                       type="text" 
                       name="name" 
                       required 
                       value={formName}
                       onChange={(e) => setFormName(e.target.value)}
                       placeholder="Ej. Evaluación Calidad Científica 2026" 
                       className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Descripción Breve</label>
                    <textarea 
                       name="description" 
                       rows={2} 
                       value={formDescription}
                       onChange={(e) => setFormDescription(e.target.value)}
                       className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium resize-none" 
                    />
                 </div>

                 <div className="space-y-8 pt-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                       <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Puntos de Evaluación</h4>
                       <Button type="button" onClick={addCriterion} variant="outline" size="sm" className="h-9 px-4 rounded-xl border-dashed border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all">
                          + Agregar Criterio
                       </Button>
                    </div>

                    <div className="space-y-12 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                       {criteria.map((c, i) => (
                          <div key={i} className="space-y-6 relative group/cri">
                             <div className="text-center text-[10px] font-bold text-slate-300 bg-white px-3 relative z-10 mx-auto w-fit">
                                {i + 1}
                             </div>

                             <div className="space-y-4">
                                <div className="space-y-2 text-center">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Criterio</label>
                                   <input 
                                      type="text" 
                                      value={c.name} 
                                      onChange={(e) => updateCriterion(i, 'name', e.target.value)} 
                                      placeholder="Ej. Originalidad"
                                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium"
                                   />
                                </div>

                                <div className="space-y-2 text-center">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Instrucción</label>
                                   <input 
                                      type="text" 
                                      value={c.instruction} 
                                      onChange={(e) => updateCriterion(i, 'instruction', e.target.value)} 
                                      placeholder="Guía para el par..."
                                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium"
                                   />
                                </div>

                                <div className="space-y-2 text-center max-w-[400px] mx-auto">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Máx</label>
                                   <input 
                                      type="number" 
                                      value={c.maxScore} 
                                      onChange={(e) => updateCriterion(i, 'maxScore', parseInt(e.target.value))} 
                                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-center text-sm font-serif font-bold"
                                   />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                   <button 
                                      type="button" 
                                      onClick={() => updateCriterion(i, 'commentsEnabled', !c.commentsEnabled)}
                                      className={cn(
                                         "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                                         c.commentsEnabled ? "text-emerald-600" : "text-slate-300"
                                      )}
                                   >
                                      <div className={cn(
                                         "h-4 w-4 rounded border flex items-center justify-center transition-all",
                                         c.commentsEnabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                                      )}>
                                         {c.commentsEnabled && <Check className="h-2.5 w-2.5" />}
                                      </div>
                                      Anotación del Evaluador Habilitada
                                   </button>
                                   <button type="button" onClick={() => removeCriterion(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                                      <Trash2 className="h-4 w-4" />
                                   </button>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-4 pt-6">
                    <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Cancelar</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-rose-200/50">
                       {loading ? 'Sincronizando...' : 'Guardar Rúbrica'}
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
