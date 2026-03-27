'use client'

import { useState } from 'react'
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
  Microscope
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Props {
  call: any
  user: any
  researchLines: any[]
}

type Step = 'GENERAL' | 'FORM' | 'PEOPLE' | 'SCHEDULE'

export default function ProjectSubmissionClient({ call, user, researchLines }: Props) {
  const [activeStep, setActiveStep] = useState<Step>('GENERAL')
  const [loading, setLoading] = useState(false)
  
  // Constants for Roles
  const PERSONAL_ROLES = [
    'DESARROLLADOR', 'ESTUDIANTE DE MAESTRÍA', 'INVESTIGADOR PRINCIPAL',
    'JOVEN INVESTIGADOR E INNOVADOR', 'PERSONAL DE APOYO', 'PERSONAL TÉCNICO'
  ];

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    researchLine: '',
    city: '',
    duration: 12,
    dynamicData: {} as Record<string, string>
  })

  // Team State
  const [teamMembers, setTeamMembers] = useState<any[]>([
    { 
      role: 'INVESTIGADOR PRINCIPAL', 
      firstName: (user.name || '').split(' ')[0] || '',
      lastName: (user.name || '').split(' ').slice(1).join(' ') || '',
      email: user.email,
      isLeader: true,
      dedication: 20,
      months: call.duration || 12,
      hourlyRate: 0,
      function: 'Dirección General del Proyecto',
      group: ''
    }
  ])

  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    role: '',
    firstName: '',
    lastName: '',
    secondLastName: '',
    birthDate: '',
    country: '',
    email: '',
    gender: '',
    dedication: 0,
    months: 0,
    hourlyRate: 0,
    function: '',
    group: ''
  })

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
        principalInvestigator: `${teamMembers[0].firstName} ${teamMembers[0].lastName}`,
        leaderEmail: user.email,
        projectCallId: call._id,
        budget: teamMembers.reduce((acc, m) => acc + (m.dedication * 4 * m.months * m.hourlyRate), 0),
        startDate: new Date(),
        dynamicData: formData.dynamicData,
        status: 'SUBMITTED'
      }

      const res = await createProject(projectPayload as any)
      
      if (res.success) {
        window.location.href = '/dashboard/projects'
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

  const STEPS = [
    { id: 'GENERAL', label: 'Generalidades', icon: Info },
    { id: 'FORM', label: 'Formulario Específico', icon: ClipboardList },
    { id: 'PEOPLE', label: 'Personal y Grupos', icon: Users },
    { id: 'SCHEDULE', label: 'Cronograma', icon: Calendar }
  ] as const

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 font-outfit">
      <div className="max-w-[1600px] mx-auto">
        
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
                               onClick={() => setShowAddMember(true)}
                               className="h-14 px-8 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                             >
                               <Plus className="mr-3 h-4 w-4" /> Vincular Personal
                             </Button>
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
                                         <h4 className="text-lg font-bold text-slate-800 tracking-tight">{member.firstName} {member.lastName}</h4>
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
                                         <p className="text-sm font-bold text-slate-700 font-serif">${(member.dedication * 4 * member.months * member.hourlyRate).toLocaleString()}</p>
                                      </div>
                                      <button 
                                        onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))}
                                        className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all"
                                      >
                                         <Plus className="h-5 w-5 rotate-45" />
                                      </button>
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
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Primer Apellido *</label>
                                     <input 
                                       type="text"
                                       value={newMember.lastName}
                                       onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                                       className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/20"
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Nombres *</label>
                                     <input 
                                       type="text"
                                       value={newMember.firstName}
                                       onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
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
                                  <input 
                                    type="text"
                                    value={newMember.group}
                                    placeholder="Nombre del grupo en la institución..."
                                    onChange={(e) => setNewMember({...newMember, group: e.target.value})}
                                    className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                  />
                               </div>

                               <div className="flex gap-4 justify-end">
                                  <Button onClick={() => setShowAddMember(false)} variant="ghost" className="h-14 px-8 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Cancelar</Button>
                                  <Button 
                                    onClick={() => {
                                      setTeamMembers([...teamMembers, newMember]);
                                      setShowAddMember(false);
                                    }}
                                    className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-emerald-200"
                                  >
                                    Vincular Miembro
                                  </Button>
                               </div>
                            </motion.div>
                          )}

                          <div className="pt-10 flex justify-between">
                             <Button onClick={() => setActiveStep('FORM')} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Anterior</Button>
                             <Button onClick={() => setActiveStep('SCHEDULE')} className="h-16 px-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-200/50 group">
                                Siguiente Fase <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                             </Button>
                          </div>
                       </div>
                    )}

                    {activeStep === 'SCHEDULE' && (
                       <div className="space-y-12 max-w-4xl">
                          <div className="pb-8 border-b border-slate-50">
                             <h2 className="text-4xl font-serif text-slate-800 mb-2 tracking-tight">Cronograma de Actividades</h2>
                             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Fase 04: Planeación Estratégica</p>
                          </div>

                          <div className="space-y-8">
                             <div className="bg-slate-50/50 rounded-[2.5rem] p-16 border border-slate-100 border-dashed text-center">
                                <div className="h-16 w-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm">
                                   <Calendar className="h-8 w-8" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Defina las fases y productos entregables del proyecto</p>
                                <Button className="h-14 px-10 bg-white hover:bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-sm border border-emerald-100 transition-all">
                                   Configurar Diagrama
                                </Button>
                             </div>
                          </div>

                          <div className="pt-10 flex justify-between">
                             <Button onClick={() => setActiveStep('PEOPLE')} variant="ghost" className="h-16 px-12 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Anterior</Button>
                             <Button onClick={handleRadicar} disabled={loading} className="h-16 px-12 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200/50 group">
                                {loading ? 'Procesando...' : (
                                  <>
                                    Finalizar y Radicar <CheckCircle2 className="ml-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                                  </>
                                )}
                             </Button>
                          </div>
                       </div>
                    )}

                    <div className="absolute -right-20 -bottom-20 opacity-[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
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

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
