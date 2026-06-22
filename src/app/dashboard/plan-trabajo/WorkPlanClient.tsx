'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
  Plus, 
  Trash2, 
  Download, 
  Eye,
  GraduationCap,
  Microscope,
  Globe,
  Settings,
  Activity,
  AlertCircle,
  X,
  FileCheck,
  Lock,
  History,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { saveWorkPlan, saveActivityEvidence } from "@/lib/actions/plan-actions"
import { uploadFile } from "@/lib/actions/storage-actions"

interface Props {
  user: any
  faculties: any[]
  programs: any[]
  catalog: any[]
  periods: any[]
  initialPlans: any[]
}

const CATEGORIES = {
  DOCENCIA: { label: 'Docencia', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
  INVESTIGACIÓN: { label: 'Investigación', icon: Microscope, color: 'bg-sky-50 text-sky-600' },
  EXTENSIÓN: { label: 'Extensión', icon: Globe, color: 'bg-amber-50 text-amber-600' },
  INSTITUCIONAL: { label: 'Institucional', icon: Settings, color: 'bg-purple-50 text-purple-600' }
}

const BINDING_TYPES: Record<string, number | 'manual'> = {
  'PLANTA TIEMPO COMPLETO': 40,
  'PLANTA MEDIO TIEMPO': 20,
  'OCASIONAL': 40,
  'CONTRATO': 'manual'
}

type Step = 'GENERAL' | 'LABORS' | 'REVIEW'

export default function WorkPlanClient({ user, faculties, programs, catalog, periods, initialPlans }: Props) {
  const currentPeriod = periods.find(p => p.isCurrent)?.name || (periods.length > 0 ? periods[0].name : '2025-2')
  
  const [activeStep, setActiveStep] = useState<Step>('GENERAL')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    semester: currentPeriod,
    facultyId: user.profile?.faculty || '',
    programId: user.profile?.program || '',
    personalInfo: {
      fullName: user.fullName || '',
      documentNumber: user.identification || '',
      typeOfBinding: 'PLANTA TIEMPO COMPLETO',
      weeks: 22,
      weeklyHours: 40
    },
    exclusivity: 'NO'
  })

  const [activities, setActivities] = useState<any[]>([])
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null)
  // evidenceDraft: { [planId]: { [activityIndex]: { text, files } } }
  const [evidenceDraft, setEvidenceDraft] = useState<Record<string, Record<number, { text: string; files: string[] }>>>({})
  const [evidenceSaving, setEvidenceSaving] = useState<string | null>(null) // "planId-actIdx"
  const [tempActivity, setTempActivity] = useState({
    type: 'DOCENCIA' as any,
    name: '',
    weeklyHours: 0,
    multiplierFactor: 1.0,
    description: ''
  })

  const getExclusivityHours = useCallback((exclusivityType: string, weeksCount: number): number => {
    if (exclusivityType === 'DOCENCIA') {
      return 4 * 18; // 72 hours
    } else if (exclusivityType === 'INVESTIGACION' || exclusivityType === 'EXTENSION' || exclusivityType === 'COMISION') {
      return weeksCount * 4;
    }
    return 0;
  }, []);

  const EXCLUSIVITY_LABELS: Record<string, { label: string; category: string; weeks: string }> = {
    DOCENCIA:     { label: 'Exclusividad – Docencia', category: 'DOCENCIA', weeks: '18 sem. lectivas' },
    INVESTIGACION:{ label: 'Exclusividad – Investigación', category: 'INVESTIGACIÓN', weeks: 'semanas del periodo' },
    EXTENSION:    { label: 'Exclusividad – Extensión y Proy. Social', category: 'EXTENSIÓN', weeks: 'semanas del periodo' },
    COMISION:     { label: 'Exclusividad – Comisión Administrativa', category: 'INSTITUCIONAL', weeks: 'semanas del periodo' },
  };

  const getExclusivityActivity = () => {
    const ex = formData.exclusivity;
    if (!ex || ex === 'NO') return null;
    const weeks = ex === 'DOCENCIA' ? 18 : formData.personalInfo.weeks;
    const semesterHours = 4 * weeks;
    const info = EXCLUSIVITY_LABELS[ex];
    return {
      type: info.category,
      name: info.label,
      weeklyHours: 4,
      multiplierFactor: 1.0,
      semesterHours,
      weeksLabel: info.weeks,
      isExclusivity: true,
    };
  };

  const getWeeksForPeriodAndBinding = useCallback((semesterName: string, bindingType: string): number => {
    const period = periods.find(p => p.name === semesterName);
    if (!period) return 22; // default fallback if period not found
    
    // Homologate the bindingType
    const normalized = bindingType.toUpperCase();
    if (normalized.includes('PLANTA')) {
      return period.weeksPlanta ?? 23;
    } else if (normalized.includes('OCASIONAL')) {
      return period.weeksOcasionales ?? 23;
    } else if (normalized.includes('CONTRATO')) {
      return period.weeksContrato ?? 18;
    }
    return 22; // default fallback
  }, [periods]);

  // Synchronize with existing plans when semester changes
  useEffect(() => {
    const existingPlan = initialPlans.find(p => p.semester === formData.semester)
    if (existingPlan) {
      setFormData({
        semester: existingPlan.semester,
        facultyId: existingPlan.facultyId || user.profile?.faculty || '',
        programId: existingPlan.programId || user.profile?.program || '',
        personalInfo: existingPlan.personalInfo,
        exclusivity: existingPlan.exclusivity || 'NO'
      } as any)
      setActivities(existingPlan.activities)
      setIsSubmitted(existingPlan.status === 'SUBMITTED' || existingPlan.status === 'ENDORSED' || existingPlan.status === 'APPROVED')
    } else {
      setActivities([])
      setIsSubmitted(false)
      setFormData(prev => {
        const currentBinding = prev.personalInfo.typeOfBinding === 'PLANTA EXCLUSIVIDAD' ? 'PLANTA TIEMPO COMPLETO' : (prev.personalInfo.typeOfBinding || 'PLANTA TIEMPO COMPLETO');
        const calculatedWeeks = getWeeksForPeriodAndBinding(prev.semester, currentBinding);
        const value = BINDING_TYPES[currentBinding];
        return {
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            typeOfBinding: currentBinding,
            weeklyHours: value === 'manual' ? prev.personalInfo.weeklyHours : value,
            weeks: calculatedWeeks
          },
          exclusivity: 'NO'
        };
      });
    }
  }, [formData.semester, initialPlans, user.profile, getWeeksForPeriodAndBinding])

  const DOCENCIA_WEEKS = 18; // Semanas lectivas fijas para docencia directa

  const getActivityWeeks = (type: string) =>
    type === 'DOCENCIA' ? DOCENCIA_WEEKS : (formData.personalInfo.weeks || 1);

  const handleAddActivity = () => {
    const factor = tempActivity.multiplierFactor ?? 1.0;
    const weeks = getActivityWeeks(tempActivity.type);
    const semesterHours = tempActivity.weeklyHours * factor * weeks;
    setActivities([...activities, { ...tempActivity, multiplierFactor: factor, semesterHours }])
    setShowActivityModal(false)
    setTempActivity({ type: 'DOCENCIA', name: '', weeklyHours: 0, multiplierFactor: 1.0, description: '' })
  }

  const removeActivity = (idx: number) => {
    setActivities(activities.filter((_, i) => i !== idx))
  }

  const calculateTotalWeekly = (list = activities) => {
    return list.reduce((acc, act) => acc + (act.weeklyHours * (act.multiplierFactor ?? 1.0)), 0)
  }

  const calculateTotalSemester = (list = activities) => {
    const base = list.reduce((acc, act) => acc + act.semesterHours, 0);
    // When calculating the active plan total, include exclusivity
    if (list === activities) return base + getExclusivityHours(formData.exclusivity || 'NO', formData.personalInfo.weeks);
    return base;
  }

  const getSubtotalByCategory = (type: string, list = activities) => {
    const weeks = type === 'DOCENCIA' ? 18 : (formData.personalInfo.weeks || 1);
    const fromActivities = list
      .filter(a => a.type === type)
      .reduce((acc, a) => acc + (a.semesterHours || a.weeklyHours * (a.multiplierFactor ?? 1.0) * weeks), 0);
    // When calculating the active plan, include exclusivity in the right category
    if (list === activities) {
      const exAct = getExclusivityActivity();
      if (exAct && exAct.type === type) return fromActivities + exAct.semesterHours;
    }
    return fromActivities;
  }

  const handleSave = async (status: 'DRAFT' | 'SUBMITTED') => {
    setLoading(true)
    const userId = user.id || user._id; // Compatibility check
    const res = await saveWorkPlan({
      user: userId,
      semester: formData.semester,
      facultyId: formData.facultyId,
      programId: formData.programId,
      personalInfo: formData.personalInfo,
      activities,
      exclusivity: formData.exclusivity || 'NO',
      status
    })
    
    if (res.success) {
      if (status === 'SUBMITTED') {
        setIsSubmitted(true)
        alert("Plan de Trabajo radicado exitosamente.")
      } else {
        alert("Borrador guardado exitosamente.")
      }
      // Reload page to get updated data from DB
      window.location.reload()
    } else {
      alert("Error al guardar: " + res.error)
    }
    setLoading(false)
  }

  const handleBindingChange = (newBinding: string) => {
    const value = BINDING_TYPES[newBinding === 'PLANTA EXCLUSIVIDAD' ? 'PLANTA TIEMPO COMPLETO' : newBinding]
    const calculatedWeeks = getWeeksForPeriodAndBinding(formData.semester, newBinding);
    setFormData({
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        typeOfBinding: newBinding === 'PLANTA EXCLUSIVIDAD' ? 'PLANTA TIEMPO COMPLETO' : newBinding,
        weeklyHours: value === 'manual' ? formData.personalInfo.weeklyHours : value,
        weeks: calculatedWeeks
      }
    })
  }

  const isWeeklyHoursManual = BINDING_TYPES[formData.personalInfo.typeOfBinding] === 'manual'

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-outfit">
      {/* Header Estilo Radicación */}
      <div className="bg-white border-b border-slate-100 px-8 py-10 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary transition-all">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-slate-800 tracking-tight">Plan de Trabajo Docente</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{formData.semester}</span>
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    (() => {
                      const currentStatus = initialPlans.find(p => p.semester === formData.semester)?.status || 'DRAFT';
                      return currentStatus === 'APPROVED' ? "text-emerald-600 bg-emerald-50" :
                             currentStatus === 'ENDORSED' ? "text-indigo-600 bg-indigo-50" :
                             currentStatus === 'SUBMITTED' ? "text-sky-600 bg-sky-50" :
                             currentStatus === 'REJECTED' ? "text-rose-600 bg-rose-50" :
                             "text-amber-600 bg-amber-50";
                    })()
                )}>
                    {(() => {
                      const currentStatus = initialPlans.find(p => p.semester === formData.semester)?.status || 'DRAFT';
                      return currentStatus === 'APPROVED' ? 'APROBADO' :
                             currentStatus === 'ENDORSED' ? 'AVALADO' :
                             currentStatus === 'SUBMITTED' ? 'RADICADO' :
                             currentStatus === 'REJECTED' ? 'REQUIERE AJUSTES' :
                             'EN DESARROLLO';
                    })()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end mr-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carga Proyectada</p>
                <p className={cn(
                  "text-xl font-serif",
                  calculateTotalSemester() > (formData.personalInfo.weeklyHours * formData.personalInfo.weeks + getExclusivityHours(formData.exclusivity || 'NO', formData.personalInfo.weeks)) ? "text-rose-500" : "text-emerald-500"
                )}>
                   {calculateTotalSemester().toFixed(1)} / {(formData.personalInfo.weeklyHours * formData.personalInfo.weeks + getExclusivityHours(formData.exclusivity || 'NO', formData.personalInfo.weeks)).toFixed(1)} hrs
                </p>
             </div>

             {!isSubmitted && (
               <div className="flex items-center gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleSave('DRAFT')}
                    disabled={loading}
                    className="h-14 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all font-bold uppercase tracking-widest text-[10px]"
                  >
                    <Save className="mr-2 h-4 w-4" /> {loading ? '...' : 'Borrador'}
                  </Button>
                  <Button 
                    onClick={() => handleSave('SUBMITTED')}
                    disabled={loading}
                    className="h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-200 transition-all font-bold uppercase tracking-widest text-[11px]"
                  >
                    <Send className="mr-2 h-4 w-4" /> Radicar Plan
                  </Button>
               </div>
             )}

             {isSubmitted && (
                  <div className={cn(
                     "border px-6 py-3 rounded-2xl flex items-center gap-3",
                     (() => {
                       const currentStatus = initialPlans.find(p => p.semester === formData.semester)?.status || 'DRAFT';
                       return currentStatus === 'APPROVED' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                              currentStatus === 'ENDORSED' ? "bg-indigo-50 border-indigo-100 text-indigo-700" :
                              "bg-sky-50 border-sky-100 text-sky-700";
                     })()
                  )}>
                     <FileCheck className={cn(
                        "h-5 w-5",
                        (() => {
                          const currentStatus = initialPlans.find(p => p.semester === formData.semester)?.status || 'DRAFT';
                          return currentStatus === 'APPROVED' ? "text-emerald-600" :
                                 currentStatus === 'ENDORSED' ? "text-indigo-600" :
                                 "text-sky-600";
                        })()
                     )} />
                     <span className="text-[10px] font-black uppercase tracking-widest">
                       {(() => {
                         const currentStatus = initialPlans.find(p => p.semester === formData.semester)?.status || 'DRAFT';
                         return currentStatus === 'APPROVED' ? 'Plan Aprobado' :
                                currentStatus === 'ENDORSED' ? 'Plan Avalado' :
                                'Plan Radicado';
                       })()}
                     </span>
                  </div>
             )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm sticky top-40">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Asistente de Registro</h3>
            <div className="space-y-2">
              {[
                { id: 'GENERAL', label: 'Generalidades', icon: Info },
                { id: 'LABORS', label: 'Labores y Actividades', icon: Activity },
                { id: 'REVIEW', label: 'Resumen Semestral', icon: CheckCircle2 }
              ].map((step, i) => (
                <button
                   key={step.id}
                   onClick={() => setActiveStep(step.id as Step)}
                   className={cn(
                     "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group",
                     activeStep === step.id ? "bg-primary text-white shadow-lg shadow-emerald-100" : "text-slate-400 hover:bg-slate-50"
                   )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                    activeStep === step.id ? "bg-white/20" : "bg-slate-50 group-hover:bg-slate-100"
                  )}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest">{step.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm relative overflow-hidden"
            >
              {isSubmitted && (
                 <div className="absolute inset-0 z-50 bg-white/40 backdrop-blur-[1px] cursor-not-allowed pointer-events-auto" title="Plan radicado bloqueado" />
              )}

              {activeStep === 'GENERAL' && (
                <div className="space-y-12">
                   <div className="pb-8 border-b border-slate-50">
                     <h2 className="text-3xl font-serif text-slate-800">Información General</h2>
                     <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Defina el marco académico de su plan de trabajo</p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodo Semestral</label>
                        <select 
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                          value={formData.semester}
                          onChange={(e) => setFormData({...formData, semester: e.target.value})}
                        >
                           {periods.map(p => (
                             <option key={p._id} value={p.name}>{p.name} {p.status === 'CLOSED' ? '(CERRADO)' : ''}</option>
                           ))}
                           {periods.length === 0 && <option value="2025-2">2025-2</option>}
                        </select>

                        {periods.find(p => p.name === formData.semester)?.status === 'CLOSED' && (
                           <div className="flex items-center gap-2 mt-2 text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-[8px] font-bold uppercase tracking-widest leading-relaxed">Este periodo está cerrado. No se permite radicación.</span>
                           </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Vinculación</label>
                        <select 
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                          value={formData.personalInfo.typeOfBinding}
                          onChange={(e) => handleBindingChange(e.target.value)}
                        >
                            {Object.keys(BINDING_TYPES).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semanas de Duración</label>
                        <input 
                          type="number"
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                          value={formData.personalInfo.weeks}
                          onChange={(e) => setFormData({...formData, personalInfo: {...formData.personalInfo, weeks: parseInt(e.target.value) || 0}})}
                        />
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horas Semanales Totales</label>
                         <div className="relative">
                             <input 
                             type="number"
                             readOnly={!isWeeklyHoursManual}
                             className={cn(
                                 "w-full h-14 border-none rounded-2xl px-6 text-sm font-bold outline-none transition-all font-outfit",
                                 isWeeklyHoursManual ? "bg-slate-50 text-slate-700 focus:ring-2 focus:ring-primary/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                             )}
                             value={formData.personalInfo.weeklyHours}
                             onChange={(e) => isWeeklyHoursManual && setFormData({...formData, personalInfo: {...formData.personalInfo, weeklyHours: parseInt(e.target.value) || 0}})}
                             />
                             {!isWeeklyHoursManual && (
                                 <Lock className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                             )}
                         </div>
                       </div>

                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Solicito Exclusividad</label>
                         <select 
                           value={formData.exclusivity || 'NO'}
                           onChange={(e) => setFormData({...formData, exclusivity: e.target.value as any})}
                           className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit cursor-pointer appearance-none"
                         >
                            <option value="NO">No</option>
                            <option value="DOCENCIA">Docencia (+72h semestre)</option>
                            <option value="INVESTIGACION">Investigación (+4h/sem)</option>
                            <option value="EXTENSION">Extensión y Proyección Social (+4h/sem)</option>
                            <option value="COMISION">Comisión Administrativa (+4h/sem)</option>
                         </select>
                       </div>
                   </div>

                   <div className="pt-8 flex justify-end">
                      <Button 
                        onClick={() => setActiveStep('LABORS')} 
                        disabled={periods.find(p => p.name === formData.semester)?.status === 'CLOSED'}
                        className="h-16 px-12 bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-xl shadow-emerald-100 font-bold uppercase tracking-widest text-[11px] disabled:opacity-30"
                      >
                        Continuar a Labores <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                   </div>
                </div>
              )}

              {activeStep === 'LABORS' && (
                <div className="space-y-10">
                   <div className="flex items-center justify-between pb-8 border-b border-slate-50">
                     <div>
                       <h2 className="text-3xl font-serif text-slate-800">Labores Académicas</h2>
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Registre sus actividades en investigación, extensión e instituciones</p>
                     </div>
                     <Button 
                      onClick={() => setShowActivityModal(true)}
                      className="h-14 bg-white text-primary border border-primary/20 hover:bg-primary hover:text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all"
                     >
                       <Plus className="mr-2 h-4 w-4" /> Agregar Labor
                     </Button>
                   </div>

                   {/* Aviso de exclusividad activa */}
                   {formData.exclusivity && formData.exclusivity !== 'NO' && (() => {
                     const exAct = getExclusivityActivity()!;
                     return (
                       <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 flex items-center gap-5">
                         <div className="h-10 w-10 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                           <Lock className="h-4 w-4 text-indigo-500" />
                         </div>
                         <div className="flex-1">
                           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-0.5">Exclusividad Activa · {exAct.type}</p>
                           <p className="text-sm font-bold text-indigo-700">{exAct.name}</p>
                           <p className="text-[10px] font-bold text-indigo-400 mt-0.5">
                             4 hrs/sem × {exAct.weeksLabel} = <strong>{exAct.semesterHours.toFixed(1)} hrs sem.</strong>
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Para quitar</p>
                           <p className="text-[9px] font-bold text-indigo-400">ve a Generalidades y
cambia exclusividad a "No"</p>
                         </div>
                       </div>
                     );
                   })()}

                   <div className="grid grid-cols-1 gap-6">
                      {activities.length === 0 && (!formData.exclusivity || formData.exclusivity === 'NO') ? (
                        <div className="bg-slate-50/50 rounded-[2rem] p-20 text-center flex flex-col items-center gap-4">
                           <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
                              <Activity className="h-8 w-8" />
                           </div>
                           <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No hay labores registradas aún</p>
                        </div>
                      ) : (
                        <>
                          {activities.map((act, i) => (
                             <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between group hover:shadow-lg hover:shadow-slate-100 transition-all">
                                <div className="flex items-center gap-6">
                                   <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", CATEGORIES[act.type as keyof typeof CATEGORIES]?.color)}>
                                      {React.createElement(CATEGORIES[act.type as keyof typeof CATEGORIES]?.icon || Activity, { size: 24 })}
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{act.type}</p>
                                      <h4 className="font-serif text-slate-800 text-lg line-clamp-1">{act.name}</h4>
                                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base: {act.weeklyHours.toFixed(1)} hrs</span>
                                         <span className="w-1 h-1 rounded-full bg-slate-200" />
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Factor: {act.multiplierFactor.toFixed(1)}</span>
                                         <span className="w-1 h-1 rounded-full bg-slate-200" />
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semanal: {(act.weeklyHours * (act.multiplierFactor ?? 1.0)).toFixed(1)} hrs</span>
                                         <span className="w-1 h-1 rounded-full bg-slate-200" />
                                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Semestral: {act.semesterHours.toFixed(1)} hrs</span>
                                      </div>
                                   </div>
                                </div>
                                <Button 
                                 onClick={() => removeActivity(i)}
                                 variant="ghost" 
                                 className="h-12 w-12 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                >
                                   <Trash2 className="h-5 w-5" />
                                </Button>
                             </div>
                          ))}
                        </>
                      )}
                   </div>

                   <div className="pt-8 flex justify-between">
                      <Button onClick={() => setActiveStep('GENERAL')} variant="ghost" className="h-16 px-12 text-slate-400 font-bold uppercase tracking-widest text-[11px]">Volver</Button>
                      <Button onClick={() => setActiveStep('REVIEW')} className="h-16 px-12 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px]">Ver Resumen Final</Button>
                   </div>
                </div>
              )}

              {activeStep === 'REVIEW' && (
                <div className="space-y-12">
                   <div className="pb-8 border-b border-slate-50 flex items-center justify-between">
                     <div>
                       <h2 className="text-3xl font-serif text-slate-800">Resumen y Radicación</h2>
                       <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Consolidado final de carga horaria por categoría</p>
                     </div>
                   </div>

                   <div className="bg-slate-50/50 rounded-[3rem] p-12 border border-slate-100">
                      <div className="grid grid-cols-1 gap-8">
                         {Object.keys(CATEGORIES).map((catKey) => {
                            const cat = CATEGORIES[catKey as keyof typeof CATEGORIES]
                            const semHrs = getSubtotalByCategory(catKey)
                            const percentage = (semHrs / (calculateTotalSemester() || 1)) * 100

                            return (
                               <div key={catKey} className="space-y-3">
                                  <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-4">
                                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center scale-90", cat.color)}>
                                            {React.createElement(cat.icon, { size: 16 })}
                                        </div>
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{cat.label}</span>
                                     </div>
                                     <div className="flex items-center gap-6">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal: {semHrs.toFixed(1)} hrs</span>
                                        <span className="text-xs font-serif text-slate-800">{percentage.toFixed(0)}%</span>
                                     </div>
                                  </div>
                                  <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100 shadow-inner">
                                     <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      className={cn("h-full", cat.color.split(' ')[0].replace('bg-', 'bg-'))}
                                     />
                                  </div>
                               </div>
                            )
                         })}
                      </div>

                      <div className="mt-16 pt-10 border-t border-slate-200 grid grid-cols-2 gap-12">
                         <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex items-center justify-between shadow-sm">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Horas Semestral</p>
                                <h3 className="text-3xl font-serif text-slate-900 mt-1">
                                  {calculateTotalSemester().toFixed(1)} / {(formData.personalInfo.weeklyHours * formData.personalInfo.weeks + getExclusivityHours(formData.exclusivity || 'NO', formData.personalInfo.weeks)).toFixed(1)}
                                </h3>
                             </div>
                             <div className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center",
                                calculateTotalSemester() > (formData.personalInfo.weeklyHours * formData.personalInfo.weeks + getExclusivityHours(formData.exclusivity || 'NO', formData.personalInfo.weeks)) ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
                             )}>
                                <Activity />
                             </div>
                          </div>

                         <div className="bg-white rounded-[2rem] p-8 border border-slate-100 flex items-center justify-between shadow-sm">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Falta por Asignar</p>
                               <h3 className={cn("text-3xl font-serif mt-1", 
                                  (formData.personalInfo.weeklyHours * formData.personalInfo.weeks + getExclusivityHours(formData.exclusivity || 'NO', formData.personalInfo.weeks)) - calculateTotalSemester() < 0
                                    ? "text-rose-500" : "text-emerald-500")}>
                                  {((formData.personalInfo.weeklyHours * formData.personalInfo.weeks + getExclusivityHours(formData.exclusivity || 'NO', formData.personalInfo.weeks)) - calculateTotalSemester()).toFixed(1)} hrs sem.
                               </h3>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                               <Info />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-start gap-6 bg-amber-50 p-8 rounded-[2rem] border border-amber-100">
                      <AlertCircle className="text-amber-600 h-6 w-6 mt-1 flex-shrink-0" />
                      <div>
                         <h4 className="text-amber-800 font-bold text-sm">Advertencia Institucional</h4>
                         <p className="text-amber-700/70 text-xs mt-1 leading-relaxed">
                            Una vez radicado el plan de trabajo, este será enviado a revisión por el área técnico-académica. No podrá realizar cambios hasta que reciba observaciones o sea rechazado. Asegúrese de que la suma de horas proyectadas coincida con su resolución de vinculación.
                         </p>
                      </div>
                   </div>

                   <div className="pt-8 flex justify-between">
                      <Button onClick={() => setActiveStep('LABORS')} variant="ghost" className="h-16 px-12 text-slate-400 font-bold uppercase tracking-widest text-[11px]">Volver</Button>
                      {!isSubmitted && (
                         <Button onClick={() => handleSave('SUBMITTED')} className="h-16 px-12 bg-slate-900 text-white rounded-2xl shadow-2xl font-bold uppercase tracking-widest text-[11px]">Confirmar y Radicar Ahora</Button>
                      )}
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Histórico de Planes de Trabajo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm"
          >
             <div className="flex items-center gap-4 mb-10">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                   <History className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-2xl font-serif text-slate-800 tracking-tight">Histórico de Planes</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Resumen consolidado por periodo académico</p>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                   <thead>
                      <tr>
                         <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 px-6">Periodo</th>
                         <th className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 px-4 whitespace-nowrap">Docencia</th>
                         <th className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 px-4 whitespace-nowrap">Investigación</th>
                         <th className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 px-4 whitespace-nowrap">Extensión</th>
                         <th className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 px-4 whitespace-nowrap">Inst.</th>
                         <th className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 px-4 whitespace-nowrap">Total Sem.</th>
                         <th className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pb-4 px-4">Estado</th>
                         <th className="pb-4"></th>
                      </tr>
                   </thead>
                   <tbody>
                      {initialPlans.map((plan, idx) => (
                         <React.Fragment key={plan._id}>
                         <tr className="group cursor-default">
                            <td className="bg-slate-50 rounded-l-[1.5rem] py-5 px-6">
                               <div className="flex items-center gap-3">
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                  <span className="text-sm font-bold text-slate-700 font-outfit">{plan.semester}</span>
                               </div>
                            </td>
                            <td className="bg-slate-50 py-5 px-4 text-center">
                               <span className="text-xs font-bold text-slate-600">{(getSubtotalByCategory('DOCENCIA', plan.activities) / 18).toFixed(1)}h</span>
                            </td>
                            <td className="bg-slate-50 py-5 px-4 text-center">
                               <span className="text-xs font-bold text-slate-600">{(getSubtotalByCategory('INVESTIGACIÓN', plan.activities) / (plan.personalInfo.weeks || 1)).toFixed(1)}h</span>
                            </td>
                            <td className="bg-slate-50 py-5 px-4 text-center">
                               <span className="text-xs font-bold text-slate-600">{(getSubtotalByCategory('EXTENSIÓN', plan.activities) / (plan.personalInfo.weeks || 1)).toFixed(1)}h</span>
                            </td>
                            <td className="bg-slate-50 py-5 px-4 text-center">
                               <span className="text-xs font-bold text-slate-600">{(getSubtotalByCategory('INSTITUCIONAL', plan.activities) / (plan.personalInfo.weeks || 1)).toFixed(1)}h</span>
                            </td>
                            <td className="bg-slate-50 py-5 px-4 text-center">
                               <span className="text-xs font-black text-primary">{calculateTotalWeekly(plan.activities)}h</span>
                            </td>
                            <td className="bg-slate-50 py-5 px-4 text-center">
                               <div className={cn(
                                   "inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                   plan.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600" :
                                   plan.status === 'SUBMITTED' ? "bg-sky-50 text-sky-600" :
                                   plan.status === 'ENDORSED' ? "bg-indigo-50 text-indigo-600" :
                                   plan.status === 'REJECTED' ? "bg-rose-50 text-rose-600" :
                                   "bg-slate-100 text-slate-400"
                                )}>
                                   {plan.status === 'DRAFT' ? 'BORRADOR' : 
                                    plan.status === 'SUBMITTED' ? 'RADICADO' : 
                                    plan.status === 'ENDORSED' ? 'AVALADO' : 
                                    plan.status === 'APPROVED' ? 'APROBADO' : 'RECHAZADO'}
                                </div>
                            </td>
                            <td className="bg-slate-50 rounded-r-[1.5rem] py-5 px-6 text-right">
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={() => setExpandedPlanId(expandedPlanId === plan._id ? null : plan._id)}
                                 className={cn(
                                   "h-8 w-8 rounded-lg border transition-all",
                                   expandedPlanId === plan._id
                                     ? "bg-primary border-primary/20 text-white"
                                     : "bg-white border-slate-100 text-slate-400 group-hover:text-primary group-hover:border-primary/20"
                                 )}
                               >
                                  <ChevronRight className={cn("h-4 w-4 transition-transform", expandedPlanId === plan._id && "rotate-90")} />
                               </Button>
                            </td>
                         </tr>
                         {/* Expandable evidence panel */}
                         {expandedPlanId === plan._id && (
                           <tr>
                             <td colSpan={8} className="pb-4">
                               <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 border border-slate-100">
                                 <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                                   <FileCheck className="h-5 w-5 text-primary" />
                                   <div>
                                     <p className="text-sm font-bold text-slate-700">Evidencias por Actividad</p>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo {plan.semester}</p>
                                   </div>
                                 </div>
                                 {plan.activities.length === 0 ? (
                                   <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest text-center py-6">No hay actividades registradas</p>
                                 ) : (
                                   plan.activities.map((act: any, actIdx: number) => {
                                     const key = `${plan._id}-${actIdx}`;
                                     const draft = evidenceDraft[plan._id]?.[actIdx];
                                     const currentText = draft?.text ?? (act.evidenceText || '');
                                     const currentFiles: string[] = draft?.files ?? (act.evidenceFiles || []);
                                     const isSaving = evidenceSaving === key;

                                     const setDraft = (text: string, files: string[]) => {
                                       setEvidenceDraft(prev => ({
                                         ...prev,
                                         [plan._id]: { ...(prev[plan._id] || {}), [actIdx]: { text, files } }
                                       }));
                                     };

                                     const handleEvidenceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
                                       const file = e.target.files?.[0];
                                       if (!file) return;
                                       setEvidenceSaving(key);
                                       const fd = new FormData();
                                       fd.append('file', file);
                                       const res = await uploadFile(fd);
                                       setEvidenceSaving(null);
                                       if (res.success && res.url) {
                                         setDraft(currentText, [...currentFiles, res.url]);
                                       } else {
                                         alert('Error al subir archivo: ' + res.error);
                                       }
                                     };

                                     const handleSaveEvidence = async () => {
                                       setEvidenceSaving(key);
                                       const res = await saveActivityEvidence(plan._id, actIdx, currentText, currentFiles);
                                       setEvidenceSaving(null);
                                       if (!res.success) alert('Error: ' + res.error);
                                     };

                                     return (
                                       <div key={actIdx} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
                                         <div className="flex items-center gap-3">
                                           <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0", CATEGORIES[act.type as keyof typeof CATEGORIES]?.color)}>
                                             {React.createElement(CATEGORIES[act.type as keyof typeof CATEGORIES]?.icon || Activity, { size: 16 })}
                                           </div>
                                           <div className="flex-1 min-w-0">
                                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{act.type}</p>
                                             <p className="text-sm font-bold text-slate-700 truncate">{act.name}</p>
                                           </div>
                                           <span className="text-[10px] font-black text-emerald-500">{act.semesterHours?.toFixed(1)} hrs sem.</span>
                                         </div>

                                         <div className="space-y-2">
                                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Observaciones / Descripción de avance</label>
                                           <textarea
                                             rows={3}
                                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm text-slate-700 font-outfit outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                             placeholder="Describa el avance o evidencia de esta actividad..."
                                             value={currentText}
                                             onChange={e => setDraft(e.target.value, currentFiles)}
                                           />
                                         </div>

                                         {currentFiles.length > 0 && (
                                           <div className="space-y-1">
                                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Archivos adjuntos</label>
                                             <div className="flex flex-wrap gap-2">
                                               {currentFiles.map((url, fi) => (
                                                 <a key={fi} href={url} target="_blank" rel="noreferrer"
                                                   className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:text-primary hover:border-primary/20 transition-all"
                                                 >
                                                   <Eye className="h-3 w-3" />
                                                   Archivo {fi + 1}
                                                 </a>
                                               ))}
                                             </div>
                                           </div>
                                         )}

                                         <div className="flex items-center gap-3 pt-2">
                                           <label className="flex items-center gap-2 h-10 px-5 bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 rounded-2xl cursor-pointer transition-all">
                                             <Download className="h-4 w-4 text-slate-400" />
                                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                               {isSaving && evidenceSaving === key ? 'Subiendo...' : 'Cargar evidencia'}
                                             </span>
                                             <input type="file" className="hidden" onChange={handleEvidenceFile} disabled={!!evidenceSaving} />
                                           </label>
                                           <Button
                                             onClick={handleSaveEvidence}
                                             disabled={!!evidenceSaving}
                                             className="h-10 px-5 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                           >
                                             {isSaving ? 'Guardando...' : <><Save className="h-3 w-3 mr-1.5" />Guardar</>}
                                           </Button>
                                         </div>
                                       </div>
                                     );
                                   })
                                 )}
                               </div>
                             </td>
                           </tr>
                         )}
                         </React.Fragment>
                      ))}
                      {initialPlans.length === 0 && (
                         <tr>
                            <td colSpan={8} className="bg-slate-50/50 rounded-[1.5rem] py-12 text-center">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No hay historial de planes registrados</p>
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Adicionar Labor */}
      {showActivityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
           >
              <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-serif text-slate-800">Nueva Labor Académica</h3>
                      {/* Indicador de horas restantes */}
                      {(() => {
                        const totalCapacity = formData.personalInfo.weeklyHours * formData.personalInfo.weeks
                          + getExclusivityHours(formData.exclusivity || 'NO', formData.personalInfo.weeks);
                        const alreadyAssigned = calculateTotalSemester();
                        const thisActivityHours = tempActivity.weeklyHours * tempActivity.multiplierFactor
                          * (tempActivity.type === 'DOCENCIA' ? 18 : formData.personalInfo.weeks);
                        const remaining = totalCapacity - alreadyAssigned;
                        const afterThis = remaining - thisActivityHours;
                        const isOver = afterThis < 0;
                        return (
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${remaining <= 0 ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                              <span className={`text-[9px] font-black uppercase tracking-widest ${remaining <= 0 ? 'text-rose-400' : 'text-emerald-500'}`}>
                                Falta por asignar
                              </span>
                              <span className={`text-sm font-black font-serif ${remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {remaining.toFixed(1)} hrs sem.
                              </span>
                            </div>
                            {tempActivity.weeklyHours > 0 && (
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${isOver ? 'bg-rose-50 border border-rose-100' : 'bg-slate-50 border border-slate-100'}`}>
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isOver ? 'text-rose-400' : 'text-slate-400'}`}>
                                  Al agregar esta
                                </span>
                                <span className={`text-sm font-black font-serif ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                                  {afterThis.toFixed(1)} hrs
                                </span>
                                {isOver && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">⚠ Excede</span>}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <button onClick={() => setShowActivityModal(false)} className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 flex-shrink-0 ml-4">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
               </div>

              <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Categoría de Labor</label>
                        <select 
                         className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                         value={tempActivity.type}
                         onChange={(e) => {
                           const newType = e.target.value as any;
                           setTempActivity({
                            ...tempActivity, 
                            type: newType, 
                            name: '', 
                            weeklyHours: 0,
                            multiplierFactor: newType === 'DOCENCIA' ? 1.5 : 1.0
                           })
                         }}
                        >
                           {Object.keys(CATEGORIES).map(k => (
                             <option key={k} value={k}>{CATEGORIES[k as keyof typeof CATEGORIES].label}</option>
                           ))}
                        </select>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">2. Actividad / Cargo (Catálogo)</label>
                        <select 
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                          value={tempActivity.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const selected = catalog.find(c => c.name === val && c.type === tempActivity.type);
                            setTempActivity({
                              ...tempActivity, 
                              name: val,
                              weeklyHours: selected ? selected.weeklyHours : (val === 'OTRA' ? 0 : tempActivity.weeklyHours),
                              multiplierFactor: selected ? (selected.multiplierFactor ?? 1.0) : (tempActivity.type === 'DOCENCIA' ? 1.5 : 1.0)
                            })
                          }}
                        >
                            <option value="">Seleccione una labor...</option>
                            {catalog.filter(c => c.type === tempActivity.type).map(a => (
                              <option key={a._id} value={a.name}>{a.name}</option>
                            ))}
                            <option value="OTRA">OTRA (Especificar en descripción)</option>
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">3. Horas Semanales Base</label>
                        <div className="relative">
                          <input 
                            type="number"
                            className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit font-black"
                            value={tempActivity.weeklyHours}
                            onChange={(e) => setTempActivity({...tempActivity, weeklyHours: parseInt(e.target.value) || 0})}
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary/40 uppercase tracking-widest">Hrs / Sem</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">4. Factor Multiplicador</label>
                        <input 
                          type="number"
                          step="0.1"
                          min="0.1"
                          className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit font-black"
                          value={tempActivity.multiplierFactor}
                          onChange={(e) => setTempActivity({...tempActivity, multiplierFactor: parseFloat(e.target.value) || 1.0})}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Semestre (Resultante)</label>
                        <div className="w-full h-14 bg-slate-100/50 rounded-2xl px-6 flex items-center text-sm font-black text-slate-500 font-outfit">
                           {(tempActivity.weeklyHours * tempActivity.multiplierFactor * (tempActivity.type === 'DOCENCIA' ? 18 : formData.personalInfo.weeks)).toLocaleString()} hrs totales
                           {tempActivity.type === 'DOCENCIA' && <span className="ml-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">(18 sem. lectivas)</span>}
                        </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción / Observaciones</label>
                     <textarea 
                       className="w-full h-32 bg-slate-50 border-none rounded-3xl p-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                       placeholder="Proporcione detalles sobre el alcance..."
                       value={tempActivity.description}
                       onChange={(e) => setTempActivity({...tempActivity, description: e.target.value})}
                     />
                  </div>

                  <div className="pt-4">
                     <Button 
                       onClick={handleAddActivity}
                       disabled={!tempActivity.name}
                       className="w-full h-16 bg-primary text-white rounded-2xl shadow-xl shadow-emerald-100 font-bold uppercase tracking-widest text-[11px]"
                     >
                       Agregar a mi Plan <Plus className="ml-2 h-4 w-4" />
                     </Button>
                  </div>
              </div>
           </motion.div>
        </div>
      )}
    </main>
  )
}
