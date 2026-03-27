'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  ChevronLeft,
  Calendar,
  DollarSign,
  Users,
  Settings,
  ClipboardList,
  Check,
  Clock,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
  Scale
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createProjectCall, getProjectCalls } from "@/lib/actions/admin-actions"
import { cn } from "@/lib/utils"

interface Props {
  initialCalls: any[]
  allRubrics: any[]
}

const BUILDER_FIELDS = [
  { id: 'Resumen', category: 'BASIC', label: '+ Resumen' },
  { id: 'Objetivos', category: 'BASIC', label: '+ Objetivos' },
  { id: 'Metodologia', category: 'BASIC', label: '+ Metodología' },
  { id: 'Tipo Proyecto', category: 'BASIC', label: '+ Tipo Proyecto' },
  { id: 'Planteamiento', category: 'SCIENTIFIC', label: '+ Planteamiento' },
  { id: 'Magnitud Impacto', category: 'SCIENTIFIC', label: '+ Magnitud e Impacto' },
  { id: 'Arbol Problemas', category: 'SCIENTIFIC', label: '+ Árbol Problemas' },
  { id: 'Arbol Objetivos', category: 'SCIENTIFIC', label: '+ Árbol Objetivos' },
  { id: 'Tabla Vacia', category: 'SCIENTIFIC', label: '+ Tabla Vacía' },
  { id: 'Antecedentes', category: 'SCIENTIFIC', label: '+ Antecedentes' },
  { id: 'Justificacion', category: 'SCIENTIFIC', label: '+ Justificación' },
  { id: 'Marco Conceptual', category: 'SCIENTIFIC', label: '+ Marco Conceptual' }
];

export default function CallManagementClient({ initialCalls, allRubrics }: Props) {
  const [calls, setCalls] = useState(initialCalls)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'INFO' | 'BUILDER'>('INFO')
  const [selectedFields, setSelectedFields] = useState<string[]>(['Resumen', 'Objetivos'])
  const [fieldSettings, setFieldSettings] = useState<Record<string, { maxChars: number }>>({
    'Resumen': { maxChars: 1500 },
    'Objetivos': { maxChars: 1000 }
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Controlled fields for editing
  const [formTitle, setFormTitle] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formYear, setFormYear] = useState(2026)
  const [formBudget, setFormBudget] = useState(0)
  const [formAudience, setFormAudience] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formOpening, setFormOpening] = useState('')
  const [formClosing, setFormClosing] = useState('')
  const [formRubric, setFormRubric] = useState('')

  const openNew = () => {
    setEditingId(null)
    setFormTitle('')
    setFormCode('')
    setFormYear(2026)
    setFormBudget(0)
    setFormAudience('')
    setFormDesc('')
    setFormOpening('')
    setFormClosing('')
    setFormRubric('')
    setSelectedFields(['Resumen', 'Objetivos'])
    setFieldSettings({
      'Resumen': { maxChars: 1500 },
      'Objetivos': { maxChars: 1000 }
    })
    setActiveTab('INFO') // Ensure INFO tab is active when opening new
    setShowModal(true)
  }

  const handleEdit = (call: any) => {
    // Rubric could be populated (object) or just ID (string)
    const rid = typeof call.rubricId === 'object' ? call.rubricId?._id : call.rubricId;
    
    setEditingId(call._id)
    setFormTitle(call.title || '')
    setFormCode(call.code || '')
    setFormYear(call.year || new Date().getFullYear())
    setFormBudget(call.budgetPerProject || 0)
    setFormAudience(call.targetAudience || '')
    setFormDesc(call.description || '')
    setFormRubric(rid || '')
    
    // Format date for datetime-local (YYYY-MM-DDTHH:mm)
    if (call.openingDate) {
      const d = new Date(call.openingDate);
      setFormOpening(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
    } else {
      setFormOpening('')
    }
    
    if (call.closingDate) {
      const d = new Date(call.closingDate);
      setFormClosing(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16))
    } else {
      setFormClosing('')
    }
    
    setSelectedFields(call.requiredFields || [])
    // Convert Mongoose Map to plain object if needed
    let fConfig = call.fieldConfig || {};
    if (fConfig instanceof Map) {
      fConfig = Object.fromEntries(fConfig);
    }
    setFieldSettings(fConfig)
    
    setActiveTab('INFO')
    setShowModal(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que desea eliminar esta convocatoria?')) return;
    const { deleteProjectCall } = await import("@/lib/actions/admin-actions");
    const res = await deleteProjectCall(id);
    if (res.success) {
      setCalls(calls.filter(c => c._id !== id));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formOpening || !formClosing) {
      alert("Por favor complete las fechas de apertura y cierre.");
      return;
    }

    setLoading(true)
    
    const formData = new FormData();
    formData.append('title', formTitle);
    formData.append('code', formCode);
    formData.append('year', formYear.toString());
    formData.append('budgetPerProject', formBudget.toString());
    formData.append('targetAudience', formAudience);
    formData.append('description', formDesc);
    formData.append('rubricId', formRubric);
    formData.append('openingDate', formOpening);
    formData.append('closingDate', formClosing);
    formData.append('requiredFields', JSON.stringify(selectedFields));
    formData.append('fieldConfig', JSON.stringify(fieldSettings));
    
    const { createProjectCall, updateProjectCall } = await import("@/lib/actions/admin-actions");

    const res = editingId 
      ? await updateProjectCall(editingId, formData)
      : await createProjectCall(formData);

    if (res.success) {
      if (editingId) {
        setCalls(calls.map(c => c._id === editingId ? res.data : c));
      } else {
        setCalls([res.data, ...calls]);
      }
      setShowModal(false);
      setEditingId(null);
    } else {
      alert(res.error);
    }
    setLoading(false)
  }

  const toggleField = (id: string) => {
    setSelectedFields(prev => {
       const has = prev.includes(id);
       if (has) return prev.filter(f => f !== id);
       // Add with default setting if not exists
       const nextSettings = { ...fieldSettings };
       if (!nextSettings[id]) {
          nextSettings[id] = { maxChars: 2000 };
       }
       setFieldSettings(nextSettings);
       return [...prev, id];
    });
  }

  const updateFieldMaxChars = (id: string, max: number) => {
    setFieldSettings({
      ...fieldSettings,
      [id]: { ...fieldSettings[id], maxChars: max }
    });
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
            <span className="text-primary">Convocatorias</span>
          </div>
          <h1 className="text-4xl font-serif text-slate-800">Gestionar Convocatorias</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest leading-relaxed">
            Administración de convocatorias internas y externas de investigación
          </p>
        </div>

        <Button
          onClick={openNew}
          className="h-14 px-8 bg-primary hover:bg-primary/95 text-white shadow-xl shadow-emerald-200/50 transition-all duration-300 font-bold uppercase tracking-widest text-xs rounded-2xl group"
        >
          <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" />
          Nueva Convocatoria
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {calls.map((call) => (
            <div key={call._id} className="bg-white rounded-[2.5rem] border border-slate-100/50 shadow-sm p-6 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group relative overflow-hidden flex flex-col">
               <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                    call.status === 'ABIERTA' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                  )}>
                    {call.status}
                  </div>
                  <div className="flex gap-1">
                     <button onClick={() => handleEdit(call)} className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                        <Edit2 className="h-4 w-4" />
                     </button>
                     <button onClick={() => handleDelete(call._id)} className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
               </div>

               <h3 className="text-lg font-serif text-slate-800 mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem] leading-snug">
                 {call.title}
               </h3>

               <div className="space-y-2.5 mb-5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                     <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Apertura
                     </div>
                     <span className="text-slate-800">{new Date(call.openingDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                     <div className="flex items-center gap-2 text-red-400">
                        <Clock className="h-3.5 w-3.5" />
                        Cierre
                     </div>
                     <span className="text-slate-800">{new Date(call.closingDate).toLocaleDateString()}</span>
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-4">
                     <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Presupuesto: <span className="text-emerald-600">${((call.budgetPerProject || 0) / 1000000).toFixed(0)}M</span>
                     </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl">
                    Ver Detalles <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
               </div>

               {/* Decoration */}
               <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-500">
                 <ClipboardList className="h-24 w-24" />
               </div>
            </div>
         ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl p-10 shadow-2xl my-8 relative"
            >
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-3xl font-serif text-slate-800 mb-2">{editingId ? 'Editar Convocatoria' : 'Nueva Convocatoria'}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Configuración Institucional</p>
                 </div>
                 <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                       type="button"
                       onClick={() => setActiveTab('INFO')}
                       className={cn("px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'INFO' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                    >Datos Básicos</button>
                    <button 
                       type="button"
                       onClick={() => setActiveTab('BUILDER')}
                       className={cn("px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'BUILDER' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                    >Constructor Formulario</button>
                 </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 {activeTab === 'INFO' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Título de la Convocatoria</label>
                          <input 
                            type="text" 
                            name="title" 
                            required 
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder="Ej. Convocatoria Interna 2026 para el fortalecimiento..." 
                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Número / Código</label>
                          <input 
                            type="text" 
                            name="code" 
                            required 
                            value={formCode}
                            onChange={(e) => setFormCode(e.target.value)}
                            placeholder="Ej. 001-2026" 
                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" 
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Año</label>
                             <input 
                                type="number" 
                                name="year" 
                                value={formYear}
                                onChange={(e) => setFormYear(parseInt(e.target.value))}
                                className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Presupuesto p/p ($)</label>
                             <input 
                                type="number" 
                                name="budgetPerProject" 
                                value={formBudget}
                                onChange={(e) => setFormBudget(parseInt(e.target.value))}
                                placeholder="0" 
                                className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" 
                             />
                          </div>
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">A quién va dirigida</label>
                          <input 
                            type="text" 
                            name="targetAudience" 
                            value={formAudience}
                            onChange={(e) => setFormAudience(e.target.value)}
                            placeholder="Ej. Docentes de planta, Grupos de investigación..." 
                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" 
                          />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Descripción o Base Corta</label>
                          <textarea 
                            name="description" 
                            value={formDesc}
                            onChange={(e) => setFormDesc(e.target.value)}
                            rows={3} 
                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium resize-none" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Fecha de Apertura</label>
                          <input 
                            type="datetime-local" 
                            name="openingDate" 
                            required 
                            value={formOpening}
                            onChange={(e) => setFormOpening(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Fecha de Cierre</label>
                          <input 
                            type="datetime-local" 
                            name="closingDate" 
                            required 
                            value={formClosing}
                            onChange={(e) => setFormClosing(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" 
                          />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Rúbrica de Evaluación</label>
                          <select 
                            name="rubricId" 
                            value={formRubric}
                            onChange={(e) => setFormRubric(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium appearance-none cursor-pointer"
                          >
                             <option value="">-- Sin rúbrica asignada (Solo recolectar) --</option>
                             {allRubrics.map(r => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                             ))}
                          </select>
                          <p className="text-[9px] text-slate-400 mt-1 italic ml-1 font-medium">Opcional. Seleccione la matriz con la que los evaluadores calificarán los proyectos en esta convocatoria.</p>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-12">
                       <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500" />
                             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Campos Básicos</h4>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                             {BUILDER_FIELDS.filter(f => f.category === 'BASIC').map(f => (
                                <button key={f.id} type="button" onClick={() => toggleField(f.id)} className={cn(
                                   "h-14 rounded-2xl border-2 transition-all flex items-center justify-center font-bold uppercase tracking-widest text-[10px] px-4",
                                   selectedFields.includes(f.id) ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-200/10" : "bg-white border-slate-100 text-slate-300 hover:border-slate-200"
                                )}> {f.label}</button>
                             ))}
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                             <div className="h-2 w-2 rounded-full bg-indigo-500" />
                             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Campos Científicos</h4>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                             {BUILDER_FIELDS.filter(f => f.category === 'SCIENTIFIC').map(field => (
                                <button
                                   key={field.id}
                                   type="button"
                                   onClick={() => toggleField(field.id)}
                                   className={cn(
                                      "p-4 rounded-2xl border transition-all text-[11px] font-bold uppercase tracking-widest text-center",
                                      selectedFields.includes(field.id) 
                                         ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-200" 
                                         : "bg-white text-slate-500 border-slate-100 hover:border-slate-200 shadow-sm"
                                   )}
                                >
                                   {field.label}
                                </button>
                             ))}
                          </div>
                       </div>

                       {selectedFields.length > 0 && (
                        <div className="space-y-6 pt-8 border-t border-slate-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Configuración de Parámetros</h4>
                                <span className="text-[9px] text-slate-300 font-bold uppercase">{selectedFields.length} campos activos</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedFields.map(f => (
                                    <div key={f} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between group/cfg">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-primary/40 group-hover/cfg:scale-125 transition-transform" />
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{f}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Máx Caracteres:</span>
                                            <input 
                                                type="number" 
                                                value={fieldSettings[f]?.maxChars || 2000}
                                                onChange={(e) => updateFieldMaxChars(f, parseInt(e.target.value))}
                                                className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center text-[10px] font-bold text-primary outline-none focus:ring-2 focus:ring-primary/10"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                       )}

                       <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 border-dashed">
                          <div className="text-center">
                             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-6 italic">Vista previa del formulario para el docente</p>
                             <div className="flex flex-wrap justify-center gap-4">
                                {['Resumen Ejecutivo', ...selectedFields].map(f => (
                                   <div key={f} className="h-8 px-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">{f}</div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 )}

                 <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Cancelar</Button>
                    <Button type="submit" disabled={loading} className="flex-1 h-14 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-200/50">
                       {loading ? 'Sincronizando...' : 'Publicar Convocatoria'}
                    </Button>
                 </div>
              </form>

              <button 
                onClick={() => setShowModal(false)}
                className="absolute right-8 top-8 h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all font-bold"
              >×</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
