'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Save,
  Send,
  ArrowRight,
  Clock,
  LayoutDashboard,
  ClipboardList,
  Target,
  FlaskConical,
  Microscope,
  Edit2,
  Edit3,
  Plus,
  Trash2, Download, ShieldCheck, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { jsPDF } from "jspdf" 
import "jspdf-autotable" 

interface Props {
  call: any
  user: any
  researchLines: any[]
  researchGroups: any[]
}

type Step = 'GENERAL' | 'FORM' | 'PEOPLE' | 'BUDGET' | 'SCHEDULE' | 'REVIEW'

// Constants for Roles
const PERSONAL_ROLES = [
  'DESARROLLADOR', 'ESTUDIANTE DE MAESTRÍA', 'INVESTIGADOR PRINCIPAL',
  'JOVEN INVESTIGADOR E INNOVADOR', 'PERSONAL DE APOYO', 'PERSONAL TÉCNICO'
];

const BUDGET_RUBROS = [
  'EQUIPOS Y SOFTWARE',
  'CAPACITACIÓN',
  'SERVICIOS TECNOLÓGICOS Y PRUEBAS',
  'MATERIALES, INSUMOS Y DOCUMENTACIÓN',
  'GASTOS DE VIAJE',
  'INFRAESTRUCTURA',
  'ADMINISTRATIVOS',
  'SEGUIMIENTO (SUPERVISIÓN Y APOYO A LA SUPERVISIÓN)',
  'OTROS'
];

const BUDGET_TYPES = ['EFECTIVO', 'ESPECIE'];

export default function ProjectSubmissionClient({ call, user, researchLines, researchGroups }: Props) {
  const [activeStep, setActiveStep] = useState<Step>('GENERAL')
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    researchLine: '',
    city: '',
    duration: 12,
    generalObjective: '',
    specificObjectives: [''],
    dynamicData: {} as Record<string, string>
  })

  // Budget equipment/software state
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null)
  const [tempItem, setTempItem] = useState<any>({
    category: BUDGET_RUBROS[0],
    description: '',
    specifications: '',
    quantity: 1,
    unitValue: 0,
    totalValue: 0,
    justification: '',
    entity: 'Universidad de Sucre',
    type: 'ESPECIE'
  })
  // Participating entities
  const [participatingEntities, setParticipatingEntities] = useState<any[]>([
    { name: 'Universidad de Sucre', isHost: true }
  ])

  // Team State
  const [teamMembers, setTeamMembers] = useState<any[]>([
    { 
      role: 'INVESTIGADOR PRINCIPAL', 
      fullName: user.name || user.fullName || '',
      email: user.email,
      isLeader: true,
      dedication: 20,
      months: call.duration || 12,
      hourlyRate: 0,
      function: 'Dirección General del Proyecto',
      group: '',
      entity: 'Universidad de Sucre'
    }
  ])


  // Schedule state
  const [activities, setActivities] = useState<any[]>([])
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [editingActivityIdx, setEditingActivityIdx] = useState<number | null>(null)
  const [tempActivity, setTempActivity] = useState<any>({
    description: "",
    objectiveIdx: 0,
    startMonth: 1,
    endMonth: 1
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState<any>({
    role: '',
    fullName: '',
    email: '',
    dedication: 20,
    months: call.duration || 12,
    hourlyRate: 0,
    function: '',
    group: '',
    entity: 'Universidad de Sucre'
  })

  const handleGeneratePDF = () => {
    const doc = new jsPDF()
    const primary = "#0f172a" 
    
    doc.setFillColor(primary)
    doc.rect(0, 0, 210, 40, "F")
    doc.setTextColor("#ffffff")
    doc.setFontSize(22)
    doc.text("SIGAI - Propuesta de Investigacion", 20, 25)
    doc.setFontSize(10)
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 160, 25)
    
    let y = 55
    doc.setTextColor(primary)
    doc.setFontSize(16)
    doc.text(formData.title || "Propuesta sin Titulo", 20, y, { maxWidth: 170 })
    y += 15

    const addSection = (title: string, content: string) => {
       if (y > 260) { doc.addPage(); y = 20 }
       doc.setFontSize(11); doc.setTextColor(primary); doc.setFont("helvetica", "bold")
       doc.text(title.toUpperCase(), 20, y)
       y += 6; doc.setFontSize(10); doc.setTextColor("#64748b"); doc.setFont("helvetica", "normal")
       const lines = doc.splitTextToSize(content || "N/A", 170)
       doc.text(lines, 20, y)
       y += (lines.length * 5) + 12
    }

    addSection("Linea de Investigacion", formData.researchLine)
    addSection("Objetivo General", formData.generalObjective)
    
    doc.setFontSize(11); doc.setTextColor(primary); doc.setFont("helvetica", "bold")
    doc.text("OBJETIVOS ESPECIFICOS", 20, y); y += 8
    formData.specificObjectives.forEach((obj, i) => {
       doc.setFontSize(10); doc.setTextColor("#64748b"); doc.setFont("helvetica", "normal")
       doc.text(`${i+1}. ${obj}`, 25, y, { maxWidth: 165 })
       y += 10
    })
    y += 10

    addSection("Resumen Financiero", `Monto Total Estimado: $${calculateGrandTotal().toLocaleString()}`)

    doc.save(`Propuesta_SIGAI.pdf`)
  }
  const handleDynamicChange = (field: string, value: string) => {
    const config = call.fieldConfig?.[field] || {};
    const max = config.maxChars || 2000;
    if (value.length > max) return;

    setFormData({
      ...formData,
      dynamicData: { ...formData.dynamicData, [field]: value }
    });
  }

  const handleRadicar = async () => {
    try {
      setLoading(true)
      const { createProject } = await import('@/lib/actions/project-actions')
      
      const projectPayload = {
        title: formData.title,
        description: formData.description,
        principalInvestigator: teamMembers[0].fullName,
        leaderEmail: user.email,
        projectCallId: call._id,
        budget: teamMembers.reduce((acc, m) => acc + (m.dedication * 4 * m.months * (m.hourlyRate || 0)), 0),
        startDate: new Date(),
        dynamicData: formData.dynamicData,
        teamMembers: teamMembers,
        budgetItems: budgetItems,
        schedule: activities,
        status: 'SUBMITTED'
      }

      const res = await createProject(projectPayload as any)
      
      if (res.success) {
        setIsSubmitted(true)
        alert('¡Proyecto radicado exitosamente! La edición ha sido bloqueada.')
      } else {
        alert(res.error || 'Error al radicar el proyecto')
      }
    } catch (error) {
       console.error(error)
       alert('Error de conexión al servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    alert('Borrador guardado localmente (Simulado)')
  }

  // Helper functions for budget summary table calculations
  const calculateRubroValue = (rubro: string, entityName: string) => {
    let especie = 0;
    let efectivo = 0;

    const rubroKey = rubro.toUpperCase();

    if (rubroKey === 'TALENTO HUMANO') {
      teamMembers.forEach(m => {
        if (m.entity === entityName) {
           // TH is ALWAYS especie as per prompt logic unless specified otherwise, but here we treat it as especie
           especie += (m.dedication * 4 * m.months * (m.hourlyRate || 0));
        }
      });
    } else {
      budgetItems.forEach(item => {
        if (item.category === rubroKey && item.entity === entityName) {
          if (item.type === 'ESPECIE') especie += (item.quantity * item.unitValue);
          if (item.type === 'EFECTIVO') efectivo += (item.quantity * item.unitValue);
        }
      });
    }

    return { especie, efectivo };
  }

  const calculateRubroTotal = (rubro: string) => {
     let total = 0;
     participatingEntities.forEach(ent => {
        const { especie, efectivo } = calculateRubroValue(rubro, ent.name);
        total += (especie + efectivo);
     });
     return total;
  };

  const calculateEntityTotal = (entityName: string) => {
     let especie = 0;
     let efectivo = 0;
     ['TALENTO HUMANO', ...BUDGET_RUBROS].forEach(rubro => {
        const val = calculateRubroValue(rubro, entityName);
        especie += val.especie;
        efectivo += val.efectivo;
     });
     return { especie, efectivo };
  };

  const calculateGrandTotal = () => {
     return participatingEntities.reduce((acc, ent) => {
        const { especie, efectivo } = calculateEntityTotal(ent.name);
        return acc + especie + efectivo;
     }, 0);
  };

  const STEPS = [ 
    { id: "GENERAL", label: "Generalidades", icon: Info }, 
    { id: "FORM", label: "Formulario Específico", icon: ClipboardList }, 
    { id: "PEOPLE", label: "Personal y Grupos", icon: Users }, 
    { id: "BUDGET", label: "Presupuesto", icon: Target }, 
    { id: "SCHEDULE", label: "Cronograma", icon: Calendar }, 
    { id: "REVIEW", label: "Radicación Final", icon: ShieldCheck } 
  ] as const
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 font-outfit">
      <div className="max-w-[1600px] mx-auto">
         
         {/* Budget Item Modal */}
         <AnimatePresence>
            {showItemModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden"
                  >
                     <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <div>
                           <h3 className="text-2xl font-serif text-slate-800">{editingItemIdx !== null ? 'Editar' : 'Adicionar'} Rubro de Presupuesto</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Detalle todos los parámetros financieros</p>
                        </div>
                        <button onClick={() => setShowItemModal(false)} className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                           <Trash2 className="h-5 w-5" />
                        </button>
                     </div>

                     <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Rubro Institucional</label>
                              <select 
                                 value={tempItem.category}
                                 onChange={(e) => setTempItem({...tempItem, category: e.target.value})}
                                 className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10"
                              >
                                 {BUDGET_RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descripción Corta</label>
                              <input 
                                 type="text"
                                 value={tempItem.description}
                                 onChange={(e) => setTempItem({...tempItem, description: e.target.value})}
                                 placeholder="Ej: Computador de Alto Rendimiento"
                                 className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Entidad Financiadora</label>
                              <select 
                                 value={tempItem.entity}
                                 onChange={(e) => setTempItem({...tempItem, entity: e.target.value})}
                                 className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10"
                              >
                                 {participatingEntities.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tipo de Aporte</label>
                              <select 
                                 value={tempItem.type}
                                 onChange={(e) => setTempItem({...tempItem, type: e.target.value})}
                                 className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/10"
                              >
                                 {BUDGET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cantidad</label>
                              <input 
                                 type="number"
                                 value={tempItem.quantity}
                                 onChange={(e) => setTempItem({...tempItem, quantity: parseInt(e.target.value) || 0})}
                                 className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Valor Unitario ($)</label>
                              <input 
                                 type="number"
                                 value={tempItem.unitValue}
                                 onChange={(e) => setTempItem({...tempItem, unitValue: parseInt(e.target.value) || 0})}
                                 className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Total Rubro</label>
                              <div className="w-full h-16 px-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center">
                                 <span className="text-sm font-black text-emerald-700 tracking-wider">${(tempItem.quantity * tempItem.unitValue).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Especificaciones Técnicas</label>
                           <textarea 
                              rows={3}
                              value={tempItem.specifications}
                              onChange={(e) => setTempItem({...tempItem, specifications: e.target.value})}
                              className="w-full p-6 bg-slate-50 border-none rounded-3xl text-sm font-medium resize-none shadow-inner outline-none focus:ring-4 focus:ring-emerald-500/10"
                              placeholder="Detalle características de hardware, versiones de software, etc..."
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Justificación Técnico-Científica</label>
                           <textarea 
                              rows={3}
                              value={tempItem.justification}
                              onChange={(e) => setTempItem({...tempItem, justification: e.target.value})}
                              className="w-full p-6 bg-slate-50 border-none rounded-3xl text-sm font-medium resize-none shadow-inner outline-none focus:ring-4 focus:ring-emerald-500/10"
                              placeholder="¿Cómo contribuye este rubro a los objetivos del proyecto?"
                           />
                        </div>
                     </div>

                     <div className="p-10 bg-slate-50/50 flex justify-end gap-4">
                        <Button onClick={() => setShowItemModal(false)} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Cancelar</Button>
                        <Button 
                           onClick={() => {
                              if (editingItemIdx !== null) {
                                 const newItems = [...budgetItems];
                                 newItems[editingItemIdx] = tempItem;
                                 setBudgetItems(newItems);
                              } else {
                                 setBudgetItems([...budgetItems, tempItem]);
                              }
                              setShowItemModal(false);
                           }}
                           className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-200/50"
                        >
                           {editingItemIdx !== null ? 'Actualizar Rubro' : 'Confirmar y Guardar'}
                        </Button>
                     </div>
                  </motion.div>
               </div>
            )}

          {/* Activity Modal */}
          <AnimatePresence>
             {showActivityModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                   <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden"
                   >
                      <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                         <div>
                            <h3 className="text-2xl font-serif text-slate-800">{editingActivityIdx !== null ? "Editar" : "Adicionar"} Actividad</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Estructure el plan de ejecución</p>
                         </div>
                         <button onClick={() => setShowActivityModal(false)} className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                            <Plus className="h-5 w-5 rotate-45" />
                         </button>
                      </div>

                      <div className="p-10 space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objetivo Específico Asociado</label>
                            <select 
                               value={tempActivity.objectiveIdx}
                               onChange={(e) => setTempActivity({...tempActivity, objectiveIdx: parseInt(e.target.value)})}
                               className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-[11px] font-bold uppercase outline-none focus:ring-4 focus:ring-emerald-500/10"
                            >
                               {formData.specificObjectives.map((obj, i) => (
                                  <option key={i} value={i}>Obj. {i+1}: {obj.substring(0, 80)}...</option>
                               ))}
                            </select>
                         </div>

                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción de la Actividad</label>
                     {isSubmitted && (
                        <div className="absolute inset-0 z-[60] bg-slate-50/5 backdrop-blur-[1px] cursor-not-allowed pointer-events-auto" title="Proyecto radicado - Edicion bloqueada" />
                     )}
                            <textarea 
                               rows={3}
                               value={tempActivity.description}
                               onChange={(e) => setTempActivity({...tempActivity, description: e.target.value})}
                               className="w-full p-6 bg-slate-50 border-none rounded-3xl text-sm font-medium resize-none outline-none focus:ring-4 focus:ring-emerald-500/10"
                               placeholder="¿Qué acciones se realizarán para cumplir este objetivo?"
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mes de Inicio (1 - {formData.duration})</label>
                               <input 
                                  type="number"
                                  min={1}
                                  max={formData.duration}
                                  value={tempActivity.startMonth}
                                  onChange={(e) => setTempActivity({...tempActivity, startMonth: parseInt(e.target.value) || 1})}
                                  className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mes de Finalización</label>
                               <input 
                                  type="number"
                                  min={tempActivity.startMonth}
                                  max={formData.duration}
                                  value={tempActivity.endMonth}
                                  onChange={(e) => setTempActivity({...tempActivity, endMonth: Math.min(parseInt(e.target.value) || 1, formData.duration)})}
                                  className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-500/10"
                               />
                            </div>
                         </div>
                      </div>

                      <div className="p-10 bg-slate-50/50 flex justify-end gap-4">
                         <Button onClick={() => setShowActivityModal(false)} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase text-[10px]">Cancelar</Button>
                         <Button 
                            onClick={() => {
                               if (editingActivityIdx !== null) {
                                  const up = [...activities]; up[editingActivityIdx] = tempActivity; setActivities(up);
                               } else { setActivities([...activities, tempActivity]); }
                               setShowActivityModal(false);
                            }}
                            className="h-16 px-12 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px]"
                         >
                            Confirmar y Guardar
                         </Button>
                      </div>
                   </motion.div>
                </div>
             )}
          </AnimatePresence>
         </AnimatePresence>
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-6">
              <Link href="/dashboard/convocatorias">
                 <button className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-slate-300 hover:text-emerald-500 hover:shadow-lg transition-all border border-slate-50">
                    <ChevronLeft className="h-6 w-6" />
                 </button>
              </Link>
              <div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                    Convocatoria: <span className="text-emerald-500">{call.code}</span>
                 </div>
                 <h1 className="text-3xl font-serif text-slate-800 tracking-tight">{call.title}</h1>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleSaveDraft} className="h-14 px-8 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white hover:text-primary rounded-2xl transition-all">
                 <Save className="mr-3 h-4 w-4" /> Guardar Borrador
              </Button>
              <Button onClick={handleRadicar} disabled={loading} className="h-14 px-10 bg-slate-900 hover:bg-emerald-600 text-white shadow-xl shadow-slate-200 transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl group border-0">
                 {loading ? 'Procesando...' : (
                   <>
                     <Send className="mr-3 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     Radicar Proyecto
                   </>
                 )}
              </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           {/* SIDEBAR NAVIGATION */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50">
                 <div className="space-y-2">
                    {STEPS.map((step) => {
                       const Icon = step.icon;
                       const isActive = activeStep === step.id;
                       return (
                          <button
                            key={step.id}
                            onClick={() => setActiveStep(step.id)}
                            className={cn(
                               "w-full flex items-center justify-between p-5 rounded-[1.5rem] transition-all group duration-500 relative overflow-hidden",
                               isActive 
                                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                                  : "text-slate-400 hover:bg-white hover:text-emerald-500"
                            )}
                          >
                             <div className="flex items-center gap-4 relative z-10">
                                <div className={cn(
                                   "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                                   isActive ? "bg-white/10" : "bg-slate-50 group-hover:bg-emerald-50"
                                )}>
                                   <Icon className="h-5 w-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{step.label}</span>
                             </div>
                             {isActive && <ChevronRight className="h-4 w-4 opacity-50 relative z-10" />}
                             {!isActive && <div className="h-1.5 w-1.5 rounded-full bg-slate-100 group-hover:bg-emerald-200 opacity-0 group-hover:opacity-100 transition-all" />}
                          </button>
                       );
                    })}
                 </div>

                 <div className="mt-10 p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100 relative overflow-hidden group/est">
                    <div className="relative z-10">
                       <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm mb-4">
                          <FlaskConical className="h-5 w-5" />
                       </div>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 mb-2">Puntuación Estimada</h4>
                       <p className="text-[9px] text-emerald-600/70 font-bold uppercase leading-relaxed tracking-wider">
                          Su propuesta cumple con el 85% de los criterios mínimos requeridos por la convocatoria.
                       </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover/est:scale-125 transition-transform duration-700">
                       <Microscope className="h-24 w-24 text-emerald-900" />
                    </div>
                 </div>
              </div>
           </div>

           {/* MAIN CONTENT AREA */}
           <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                 <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/80 backdrop-blur-2xl border border-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-slate-200/40 min-h-[700px] relative overflow-hidden"
                 >
                    {activeStep === 'GENERAL' && (
                       <div className="space-y-12 max-w-4xl">
                          <div className="pb-8 border-b border-slate-50">
                             <h2 className="text-4xl font-serif text-slate-800 mb-2 tracking-tight">Generalidades del Proyecto</h2>
                             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Fase 01: Definición Preliminar</p>
                          </div>
                           <div className="space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Título de la Investigación</label>
                                    <textarea
                                      rows={3}
                                      placeholder="Escriba el título completo de su proyecto..."
                                      value={formData.title}
                                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                      className="w-full px-6 py-5 bg-slate-50/50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-[11px] font-bold uppercase tracking-widest resize-none shadow-inner"
                                    />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Palabras Clave (Máx 10)</label>
                                    <textarea
                                      rows={3}
                                      placeholder="investigación, innovación, impacto, ..."
                                      value={formData.keywords}
                                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                      className="w-full px-6 py-5 bg-slate-50/50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-[11px] font-bold uppercase tracking-widest resize-none shadow-inner"
                                    />
                                 </div>
                              </div>

                              <div className="space-y-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Resumen Ejecutivo</label>
                                 <textarea
                                   rows={8}
                                   placeholder="Descripción breve de la propuesta..."
                                   value={formData.description}
                                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                   className="w-full px-6 py-5 bg-slate-50/50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-sm font-medium leading-relaxed resize-none shadow-inner"
                                 />
                                 <div className="flex justify-end pr-2">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Máximo 1500 caracteres</span>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Línea de Investigación</label>
                                    <select 
                                      value={formData.researchLine}
                                      onChange={(e) => setFormData({ ...formData, researchLine: e.target.value })}
                                      className="w-full px-6 py-5 bg-slate-50/50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-[10px] font-bold uppercase tracking-widest shadow-inner appearance-none cursor-pointer"
                                    >
                                       <option value="">Seleccionar línea...</option>
                                       {researchLines.map((line: any) => (
                                         <option key={line._id} value={line._id}>{line.name}</option>
                                       ))}
                                    </select>
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ciudad de Ejecución</label>
                                    <input
                                      type="text"
                                      placeholder="Ej: Bogotá, Medellín..."
                                      value={formData.city}
                                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                      className="w-full h-16 px-6 bg-slate-50/50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-[10px] font-bold uppercase tracking-widest shadow-inner"
                                    />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Duración (Meses)</label>
                                    <input
                                      type="number"
                                      value={formData.duration}
                                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                      className="w-full h-16 px-6 bg-slate-50/50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-[10px] font-bold uppercase tracking-widest shadow-inner"
                                    />
                                 </div>
                              </div>

                              {/* Objectives Section */}
                              <div className="space-y-10 pt-12 border-t border-slate-50 mx-2">
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Objetivo General *</label>
                                    <textarea
                                      rows={2}
                                      placeholder="Defina el propósito central de la investigación..."
                                      value={formData.generalObjective}
                                      onChange={(e) => setFormData({ ...formData, generalObjective: e.target.value })}
                                      className="w-full px-6 py-5 bg-slate-50/50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-sm font-medium leading-relaxed resize-none shadow-inner"
                                    />
                                 </div>

                                 <div className="space-y-6">
                                    <div className="flex items-center justify-between ml-1">
                                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Objetivos Específicos (Máx 5) *</label>
                                       {formData.specificObjectives.length < 5 && (
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setFormData({ 
                                              ...formData, 
                                              specificObjectives: [...formData.specificObjectives, ''] 
                                            })}
                                            className="h-8 px-4 text-emerald-600 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-50 rounded-lg"
                                          >
                                             <Plus className="mr-2 h-3 w-3" /> Adicionar
                                          </Button>
                                       )}
                                    </div>
                                    <div className="space-y-4 pl-12">
                                       {formData.specificObjectives.map((obj, idx) => (
                                          <div key={idx} className="flex gap-4 group">
                                             <div className="flex-1 relative">
                                                <input 
                                                  type="text"
                                                  placeholder={`Objetivo Específico ${idx + 1}...`}
                                                  value={obj}
                                                  onChange={(e) => {
                                                    const newObjs = [...formData.specificObjectives];
                                                    newObjs[idx] = e.target.value;
                                                    setFormData({ ...formData, specificObjectives: newObjs });
                                                  }}
                                                  className="w-full h-14 px-6 bg-slate-50/50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-[11px] font-medium shadow-inner"
                                                />
                                                <div className="absolute left-0 -translate-x-12 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                                                   {idx + 1}
                                                </div>
                                             </div>
                                             {formData.specificObjectives.length > 1 && (
                                                <button 
                                                  onClick={() => {
                                                    const newObjs = formData.specificObjectives.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, specificObjectives: newObjs });
                                                  }}
                                                  className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                   <Trash2 className="h-4 w-4" />
                                                </button>
                                             )}
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </div>
                          
                          <div className="pt-10 flex justify-end">
                             <Button onClick={() => setActiveStep('FORM')} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-200/50 group">
                                Siguiente Fase <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                             </Button>
                          </div>
                       </div>
                    )}

                    {activeStep === 'FORM' && (
                       <div className="space-y-12 max-w-4xl">
                          <div className="pb-8 border-b border-slate-50">
                             <h2 className="text-4xl font-serif text-slate-800 mb-2 tracking-tight">Formulario Específico</h2>
                             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Fase 02: Términos de Referencia Personalizados</p>
                          </div>

                          <div className="space-y-10">
                             {call.requiredFields?.map((field: string) => {
                                const config = call.fieldConfig?.[field] || {};
                                const currentText = formData.dynamicData[field] || '';
                                const max = config.maxChars || 2000;
                                
                                return (
                                   <div key={field} className="space-y-3 relative group/field">
                                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 group-hover/field:text-emerald-500 transition-colors">{field}</label>
                                      <textarea
                                        rows={6}
                                        value={currentText}
                                        onChange={(e) => handleDynamicChange(field, e.target.value)}
                                        placeholder={`Diligencie el campo ${field.toLowerCase()}...`}
                                        className="w-full px-6 py-5 bg-slate-50/50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/10 transition-all outline-none text-sm font-medium leading-relaxed resize-none shadow-inner"
                                      />
                                      <div className="flex justify-between items-center px-1">
                                         <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider italic">Este campo es requerido según ToR</p>
                                         <span className={cn(
                                            "text-[9px] font-black uppercase tracking-widest",
                                            currentText.length > max * 0.9 ? "text-rose-500" : "text-slate-300"
                                         )}>
                                            {currentText.length} / {max} caracteres
                                         </span>
                                      </div>
                                   </div>
                                );
                             })}

                             {(call.requiredFields?.length === 0 || !call.requiredFields) && (
                                <div className="py-20 text-center">
                                   <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                      <ClipboardList className="h-8 w-8" />
                                   </div>
                                   <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">No se requiere información técnica adicional para esta convocatoria.</p>
                                </div>
                             )}
                          </div>

                          <div className="pt-10 flex justify-between">
                             <Button onClick={() => setActiveStep('GENERAL')} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Anterior</Button>
                             <Button onClick={() => setActiveStep('PEOPLE')} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-200/50 group">
                                Siguiente Fase <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                             </Button>
                          </div>
                       </div>
                    )}

                    {activeStep === 'PEOPLE' && (
                       <div className="space-y-12 max-w-5/6">
                          <div className="pb-8 border-b border-slate-50 flex items-center justify-between">
                             <div>
                                <h2 className="text-4xl font-serif text-slate-800 mb-2 tracking-tight">Personal y Grupo</h2>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Fase 03: Estructura de Capital Humano</p>
                             </div>
                             <Button 
                               onClick={() => {
                                 setNewMember({
                                   role: '', fullName: '', email: '', dedication: 20, months: call.duration || 12, hourlyRate: 0, function: '', group: '', entity: 'Universidad de Sucre'
                                 });
                                 setEditingIndex(null);
                                 setShowAddMember(true);
                               }}
                               className="h-14 px-8 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                             >
                               <Plus className="mr-3 h-4 w-4" /> Vincular Personal
                             </Button>
                          </div>

                          {/* Participating Entities Management */}
                          <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-white space-y-6 mx-2">
                             <div className="flex items-center justify-between ml-2">
                                <div>
                                   <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Entidades Participantes</h3>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Gestione las instituciones que colaboran en el proyecto</p>
                                </div>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                     const name = prompt('Nombre de la entidad:');
                                     if (name) setParticipatingEntities([...participatingEntities, { name, isHost: false }]);
                                  }}
                                  className="h-10 px-6 border-emerald-100 text-emerald-600 font-black uppercase tracking-widest text-[9px] hover:bg-white rounded-xl shadow-sm"
                                >
                                   <Plus className="mr-2 h-3 w-3" /> Agregar Entidad
                                </Button>
                             </div>

                             <div className="flex flex-wrap gap-3 ml-2">
                                {participatingEntities.map((ent, idx) => (
                                   <div key={idx} className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 group/ent">
                                      <div className={cn("h-2 w-2 rounded-full", ent.isHost ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{ent.name}</span>
                                      {!ent.isHost && (
                                         <button 
                                           onClick={() => setParticipatingEntities(participatingEntities.filter((_, i) => i !== idx))}
                                           className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover/ent:opacity-100"
                                         >
                                            <Trash2 className="h-3.5 w-3.5" />
                                         </button>
                                      )}
                                   </div>
                                ))}
                             </div>
                          </div>

                          <div className="space-y-6">
                             {teamMembers.map((member, idx) => (
                                <div key={idx} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white/40 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between group shadow-sm hover:shadow-xl transition-all duration-500">
                                   <div className="flex items-center gap-6">
                                      <div className="h-16 w-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                                         {member.isLeader ? <Users className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                                      </div>
                                      <div>
                                         <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                                               {member.role}
                                            </span>
                                            {member.isLeader && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md">Líder Gral</span>}
                                         </div>
                                         <h4 className="text-lg font-bold text-slate-800 tracking-tight">{member.fullName}</h4>
                                         <div className="flex items-center gap-4 mt-1 opacity-60">
                                            <p className="text-[10px] text-slate-500 font-medium lowercase tracking-wider">{member.email}</p>
                                            <span className="text-slate-300">•</span>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{member.dedication}h/Sem • {member.months} Meses</p>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="mt-4 md:mt-0 flex items-center gap-8">
                                      <div className="text-right hidden sm:block">
                                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Presupuesto Cargo</p>
                                         <p className="text-sm font-bold text-slate-700 font-serif">${(member.dedication * 4 * member.months * (member.hourlyRate || 0)).toLocaleString()}</p>
                                      </div>
                                       <button 
                                          onClick={() => {
                                            setNewMember(member);
                                            setEditingIndex(idx);
                                            setShowAddMember(true);
                                          }}
                                          className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 hover:bg-emerald-50 shadow-sm"
                                          title="Editar información"
                                       >
                                          <Edit2 className="h-4 w-4" />
                                       </button>

                                       {!member.isLeader && (
                                          <button 
                                            onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))}
                                            className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all"
                                            title="Remover miembro"
                                          >
                                               <Plus className="h-5 w-5 rotate-45" />
                                          </button>
                                       )}
                                   </div>
                                </div>
                             ))}
                          </div>

                          {showAddMember && (
                            <motion.div 
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="bg-slate-50/50 backdrop-blur-xl border border-dashed border-slate-200 rounded-[3rem] p-10 space-y-8"
                            >
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Tipo de Personal *</label>
                                     <select 
                                       value={newMember.role}
                                       onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                                       className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/20"
                                     >
                                        <option value="">Seleccione...</option>
                                        {PERSONAL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                     </select>
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Entidad de Vinculación *</label>
                                      <select 
                                        value={newMember.entity}
                                        onChange={(e) => setNewMember({...newMember, entity: e.target.value})}
                                        className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/20"
                                      >
                                         {participatingEntities.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                                      </select>
                                   </div>
                                    <div className="md:col-span-2 space-y-2">
                                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Nombre Completo *</label>
                                      <input 
                                        type="text"
                                        value={newMember.fullName}
                                        onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                                        className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/20"
                                      />
                                   </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Email *</label>
                                     <input 
                                       type="email"
                                       value={newMember.email}
                                       onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                                       className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Dedicación (h/sem) *</label>
                                     <input 
                                       type="number"
                                       value={newMember.dedication}
                                       onChange={(e) => setNewMember({...newMember, dedication: parseInt(e.target.value)})}
                                       className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">N. Meses *</label>
                                     <input 
                                       type="number"
                                       value={newMember.months}
                                       onChange={(e) => setNewMember({...newMember, months: parseInt(e.target.value)})}
                                       className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Valor Hora *</label>
                                     <input 
                                       type="number"
                                       value={newMember.hourlyRate}
                                       onChange={(e) => setNewMember({...newMember, hourlyRate: parseInt(e.target.value)})}
                                       className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                     />
                                  </div>
                               </div>

                                <div className="space-y-2">
                                   <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Grupo de Investigación al que pertenece *</label>
                                   <select 
                                     value={newMember.group}
                                     onChange={(e) => setNewMember({...newMember, group: e.target.value})}
                                     className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                   >
                                      <option value="">Seleccione el grupo...</option>
                                      {researchGroups.map((g: any) => (
                                        <option key={g._id} value={g.name}>{g.name}</option>
                                      ))}
                                   </select>
                                </div>

                               <div className="flex gap-4 justify-end">
                                  <Button 
                                    onClick={() => {
                                      setShowAddMember(false);
                                      setEditingIndex(null);
                                    }} 
                                    variant="ghost" 
                                    className="h-14 px-8 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]"
                                  >
                                    Cancelar
                                  </Button>
                                   <Button 
                                     onClick={() => {
                                       if (editingIndex !== null) {
                                         const updatedMembers = [...teamMembers];
                                         updatedMembers[editingIndex] = newMember;
                                         setTeamMembers(updatedMembers);
                                       } else {
                                         setTeamMembers([...teamMembers, newMember]);
                                       }
                                       setShowAddMember(false);
                                       setEditingIndex(null);
                                     }}
                                     className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-emerald-200"
                                   >
                                     {editingIndex !== null ? 'Guardar Cambios' : 'Vincular Miembro'}
                                   </Button>
                               </div>
                            </motion.div>
                          )}

                           <div className="pt-10 flex justify-between">
                              <Button onClick={() => setActiveStep("FORM")} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Anterior</Button>
                              <Button onClick={() => setActiveStep("BUDGET")} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-200/50 group">Siguiente Fase <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Button>
                           </div> 
                        </div>
                     )}

                     {activeStep === 'BUDGET' && (
                        <div className="space-y-12 max-w-6xl">
                           <div className="pb-8 border-b border-slate-50 flex items-center justify-between">
                              <div>
                                 <h2 className="text-4xl font-serif text-slate-800 mb-2 tracking-tight">Presupuesto del Proyecto</h2>
                                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Fase 04: Planeación Financiera</p>
                              </div>
                              <Button 
                                 onClick={() => {
                                    setEditingItemIdx(null);
                                    setTempItem({
                                       category: BUDGET_RUBROS[0],
                                       description: '',
                                       specifications: '',
                                       quantity: 1,
                                       unitValue: 0,
                                       justification: '',
                                       entity: participatingEntities[0].name,
                                       type: 'ESPECIE'
                                    });
                                    setShowItemModal(true);
                                 }}
                                 className="h-14 px-8 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                              >
                                 <Plus className="mr-3 h-4 w-4" /> Agregar Ítem
                              </Button>
                           </div>

                           <div className="space-y-16">
                              {/* Added Items List */}
                              <div className="space-y-6">
                                 <div className="flex items-center gap-3 ml-2">
                                    <Target className="h-5 w-5 text-emerald-500" />
                                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Rubros Adicionales</h3>
                                 </div>
                                 
                                 {budgetItems.length === 0 ? (
                                    <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay rubros adicionales registrados</p>
                                    </div>
                                 ) : (
                                    <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/20">
                                       <table className="w-full border-collapse">
                                          <thead className="bg-slate-900 text-white">
                                             <tr>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-left">Rubro / Item</th>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Subtotal</th>
                                                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-center">Acciones</th>
                                             </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-50">
                                             {budgetItems.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                   <td className="p-6">
                                                      <div className="flex flex-col">
                                                         <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">{item.category}</span>
                                                         <span className="text-sm font-medium text-slate-500">{item.description}</span>
                                                         <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{item.entity} • {item.type}</span>
                                                      </div>
                                                   </td>
                                                   <td className="p-6 text-center text-base font-black text-slate-800 tracking-tight">
                                                      ${(item.quantity * item.unitValue).toLocaleString()}
                                                   </td>
                                                   <td className="p-6">
                                                      <div className="flex justify-center gap-3">
                                                         <Button 
                                                            onClick={() => { setEditingItemIdx(idx); setTempItem(item); setShowItemModal(true); }} 
                                                            variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 border-slate-100"
                                                         >
                                                            <Edit2 className="h-4 w-4" />
                                                         </Button>
                                                         <Button 
                                                            onClick={() => setBudgetItems(budgetItems.filter((_, i) => i !== idx))} 
                                                            variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                                                         >
                                                            <Trash2 className="h-4 w-4" />
                                                         </Button>
                                                      </div>
                                                   </td>
                                                </tr>
                                             ))}
                                          </tbody>
                                       </table>
                                    </div>
                                 )}
                              </div>

                              {/* Consolidated Summary Section */}
                              <div className="space-y-8 pt-12 border-t border-slate-100">
                                 <div className="flex items-center gap-3 ml-2">
                                    <ClipboardList className="h-5 w-5 text-emerald-500" />
                                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Resumen Consolidado de Presupuesto</h3>
                                 </div>

                                 <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50">
                                    <table className="w-full border-collapse">
                                       <thead>
                                          <tr className="bg-slate-900 text-white border-b border-slate-800 text-[9px] font-black uppercase tracking-widest">
                                             <th className="p-4 border-r border-slate-800">#</th>
                                             <th className="p-4 border-r border-slate-800 text-left">Rubro Institucional</th>
                                             {participatingEntities.map((ent, i) => (
                                                <th key={i} colSpan={2} className="p-4 border-r border-slate-800 text-center bg-slate-800/50">
                                                   {ent.name}
                                                </th>
                                             ))}
                                             <th className="p-4 text-center">Total</th>
                                          </tr>
                                          <tr className="bg-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
                                             <th className="p-2 border-r border-slate-200" colSpan={2}></th>
                                             {participatingEntities.map((_, i) => (
                                                <React.Fragment key={i}>
                                                   <th className="p-2 border-r border-slate-200 text-center">Especie</th>
                                                   <th className="p-2 border-r border-slate-200 text-center">Efectivo</th>
                                                </React.Fragment>
                                             ))}
                                             <th className="p-2"></th>
                                          </tr>
                                       </thead>
                                       <tbody className="divide-y divide-slate-100">
                                          {['TALENTO HUMANO', ...BUDGET_RUBROS].map((rubro, idx) => {
                                             const total = calculateRubroTotal(rubro);
                                             if (total === 0 && rubro !== 'TALENTO HUMANO') return null; // Show only used rows + TH
                                             
                                             return (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                   <td className="p-4 text-[10px] font-bold text-slate-400 text-center border-r border-slate-50">{idx + 1}</td>
                                                   <td className="p-4 text-[10px] font-black text-slate-700 uppercase tracking-wider border-r border-slate-50">{rubro}</td>
                                                   {participatingEntities.map((ent, i) => {
                                                      const values = calculateRubroValue(rubro, ent.name);
                                                      return (
                                                         <React.Fragment key={i}>
                                                            <td className="p-4 text-center text-[10px] font-bold text-slate-400 border-r border-slate-50">
                                                               {values.especie > 0 ? `$${values.especie.toLocaleString()}` : '-'}
                                                            </td>
                                                            <td className="p-4 text-center text-[10px] font-bold text-emerald-600 border-r border-slate-50 bg-emerald-50/5">
                                                               {values.efectivo > 0 ? `$${values.efectivo.toLocaleString()}` : '-'}
                                                            </td>
                                                         </React.Fragment>
                                                      );
                                                   })}
                                                   <td className="p-4 text-center text-xs font-black text-slate-800 bg-slate-50/50">
                                                      ${total.toLocaleString()}
                                                   </td>
                                                </tr>
                                             );
                                          })}
                                          {/* TOTAL ROW */}
                                          <tr className="bg-slate-900 text-white font-black">
                                             <td colSpan={2} className="p-6 text-xs text-right border-r border-slate-800">TOTAL PROYECTO</td>
                                             {participatingEntities.map((ent, i) => {
                                                const entTotal = calculateEntityTotal(ent.name);
                                                return (
                                                   <React.Fragment key={i}>
                                                      <td className="p-6 text-center border-r border-slate-800">${entTotal.especie.toLocaleString()}</td>
                                                      <td className="p-6 text-center border-r border-slate-800 bg-slate-800/30">${entTotal.efectivo.toLocaleString()}</td>
                                                   </React.Fragment>
                                                );
                                             })}
                                             <td className="p-6 text-center bg-emerald-600">
                                                ${calculateGrandTotal().toLocaleString()}
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>

                              <div className="pt-10 flex justify-between">
                                 <Button onClick={() => setActiveStep('PEOPLE')} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase tracking-widest text-[10px]">Anterior</Button>
                                 <Button onClick={() => setActiveStep('SCHEDULE')} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-200/50">Siguiente Fase</Button>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeStep === 'SCHEDULE' && (
                        <div className="space-y-12">
                           <div className="pb-8 border-b border-slate-50 flex items-center justify-between">
                              <div>
                                 <h2 className="text-4xl font-serif text-slate-800 mb-2 tracking-tight">Cronograma de Actividades</h2>
                                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Fase 05: Planeación Estratégica</p>
                              </div>
                              <Button 
                                onClick={() => {
                                  setEditingActivityIdx(null);
                                  setTempActivity({ description: '', objectiveIdx: 0, startMonth: 1, endMonth: 1 });
                                  setShowActivityModal(true);
                                }}
                                className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
                              >
                                <Plus className="mr-3 h-4 w-4" /> Agregar Actividad
                              </Button>
                           </div>

                           <div className="space-y-12">
                              {activities.length === 0 ? (
                                <div className="bg-slate-50/50 rounded-[2.5rem] p-16 border border-slate-100 border-dashed text-center">
                                   <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-6" />
                                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay actividades registradas</p>
                                </div>
                              ) : (
                                <div className="space-y-8">
                                   {activities.map((act, idx) => {
                                      const objActivities = activities.slice(0, idx).filter(a => a.objectiveIdx === act.objectiveIdx);
                                      const actNum = `${act.objectiveIdx + 1}.${objActivities.length + 1}`;
                                      
                                      return (
                                         <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all">
                                            <div className="flex justify-between items-start mb-6">
                                               <div className="flex gap-4">
                                                  <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">
                                                     {actNum}
                                                  </div>
                                                  <div>
                                                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Obj. Específico {act.objectiveIdx + 1}</span>
                                                     <h4 className="text-sm font-bold text-slate-800 mt-1">{act.description}</h4>
                                                  </div>
                                               </div>
                                               <div className="flex gap-2">
                                                  <Button onClick={() => { setEditingActivityIdx(idx); setTempActivity(act); setShowActivityModal(true); }} variant="outline" size="sm" className="h-10 w-10 p-0 rounded-xl"><Edit2 className="h-4 w-4" /></Button>
                                                  <Button onClick={() => setActivities(activities.filter((_, i) => i !== idx))} variant="ghost" size="sm" className="h-10 w-10 p-0 text-rose-500 rounded-xl"><Trash2 className="h-4 w-4" /></Button>
                                               </div>
                                            </div>

                                            {/* Gantt Visual */}
                                            <div className="space-y-4">
                                               <div className="flex items-center justify-between text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">
                                                  <span>Ejecución del Proyecto ({formData.duration} Meses)</span>
                                                  <span>Mes {act.startMonth} a Mes {act.endMonth}</span>
                                               </div>
                                               <div className="h-5 bg-slate-50 rounded-full flex overflow-hidden p-0.5 border border-slate-100">
                                                  {Array.from({ length: formData.duration }).map((_, i) => {
                                                     const isRunning = (i + 1) >= act.startMonth && (i + 1) <= act.endMonth;
                                                     return (
                                                        <div 
                                                          key={i} 
                                                          className={cn(
                                                            "flex-1 rounded-full transition-all duration-700",
                                                            isRunning ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-transparent"
                                                          )}
                                                          title={`Mes ${i+1}`}
                                                        />
                                                     )
                                                  })}
                                               </div>
                                               <div className="flex justify-between text-[7px] font-bold text-slate-400 mt-1">
                                                  {Array.from({ length: formData.duration }).map((_, i) => (
                                                     <span key={i} className="w-full text-center">{i + 1}</span>
                                                  ))}
                                               </div>
                                            </div>
                                         </div>
                                      );
                                   })}
                                </div>
                              )}
                           </div>

                           <div className="pt-10 flex justify-between">
                              <Button onClick={() => setActiveStep('BUDGET')} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase tracking-widest text-[10px]">Anterior</Button>
                              <Button onClick={() => setActiveStep('REVIEW')} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl">
                                 Revisión y Envío
                              </Button>
                           </div>
                        </div>
                     )}

                     {activeStep === 'REVIEW' && (
                        <div className="space-y-12">
                           <div className="pb-8 border-b border-slate-50">
                              <h2 className="text-4xl font-serif text-slate-800 mb-2 tracking-tight">Revisión Final y Radicación</h2>
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Fase 06: Finalización del Proceso</p>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="bg-slate-50/50 rounded-[2.5rem] p-12 border border-slate-100 flex flex-col items-center text-center">
                                 <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-emerald-500 mb-6">
                                    <Eye className="h-10 w-10" />
                                 </div>
                                 <h3 className="text-lg font-serif text-slate-800 mb-4">Vista Previa de la Propuesta</h3>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose mb-8">
                                    Genera un documento PDF oficial con toda la información técnica, presupuestal y de talento humano registrada.
                                 </p>
                                 <Button onClick={handleGeneratePDF} className="h-16 w-full bg-white text-slate-900 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-950 hover:text-white transition-all">
                                    <Download className="mr-3 h-5 w-5" /> Descargar PDF Oficial
                                 </Button>
                              </div>

                              <div className={cn(
                                 "rounded-[2.5rem] p-12 border flex flex-col items-center text-center transition-all duration-700",
                                 isSubmitted 
                                    ? "bg-emerald-50 border-emerald-100 shadow-emerald-100" 
                                    : "bg-slate-900 border-slate-800 text-white shadow-2xl shadow-slate-900/40"
                              )}>
                                 <div className={cn(
                                    "h-20 w-20 rounded-[2rem] shadow-xl flex items-center justify-center mb-6",
                                    isSubmitted ? "bg-white text-emerald-600" : "bg-emerald-500 text-white"
                                 )}>
                                    {isSubmitted ? <CheckCircle2 className="h-10 w-10" /> : <Send className="h-10 w-10" />}
                                 </div>
                                 <h3 className={cn("text-lg font-serif mb-4", isSubmitted ? "text-emerald-800" : "text-white")}>
                                    {isSubmitted ? "Proyecto Radicado" : "Enviar Propuesta"}
                                 </h3>
                                 <p className={cn("text-[10px] font-black uppercase tracking-widest leading-loose mb-8", isSubmitted ? "text-emerald-600/70" : "text-slate-400")}>
                                    {isSubmitted 
                                       ? "Su proyecto ha sido enviado satisfactoriamente. Se ha generado el código de radicación único."
                                       : "Una vez enviado, no podrá realizar modificaciones adicionales a la propuesta técnica ni financiera."}
                                 </p>
                                 <Button 
                                    onClick={handleRadicar} 
                                    disabled={loading || isSubmitted} 
                                    className={cn(
                                       "h-16 w-full rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                                       isSubmitted 
                                          ? "bg-emerald-100 text-emerald-800 cursor-default" 
                                          : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20"
                                    )}
                                 >
                                    {loading ? 'Procesando...' : isSubmitted ? 'Envío Completado' : 'Confirmar y Radicar Ahora'}
                                 </Button>
                              </div>
                           </div>

                           <div className="pt-10 flex justify-start">
                              {!isSubmitted && (
                                 <Button onClick={() => setActiveStep('SCHEDULE')} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase tracking-widest text-[10px]">Anterior</Button>
                              )}
                              {isSubmitted && (
                                 <Link href="/dashboard" className="h-16 px-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-[10px]">Ir al Dashboard</Link>
                              )}
                           </div>
                        </div>
                     )}

                     <div className="absolute -right-20 -bottom-20 opacity-[0.02] rotate-12 pointer-events-none pointer-events-none">
                        <Target className="h-96 w-96 text-slate-900" />
                     </div>
                  </motion.div>
               </AnimatePresence>
            </div>
         </div>
      </div>
    </main>
  )
}
