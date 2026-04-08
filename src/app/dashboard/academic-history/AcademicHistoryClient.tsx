'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
   Plus,
   ChevronLeft,
   BookOpen,
   GraduationCap,
   Briefcase,
   Award,
   Send,
   CheckCircle,
   Clock,
   FileText,
   AlertCircle,
   ExternalLink,
   Calculator,
   Pencil,
   Download,
   ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sendToCiarp } from "@/lib/actions/academic-actions"
import MeritRegistrationModal from "./MeritRegistrationModal"
import CiarpSubmissionModal from "./CiarpSubmissionModal"
import DashboardHeader from "@/components/dashboard/DashboardHeader"

interface Props {
   history: any[]
   user: any
}

const TABS = [
   { id: 'Títulos', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
   { id: 'Categoría', icon: Award, color: 'bg-indigo-50 text-indigo-600' },
   { id: 'Experiencia', icon: Briefcase, color: 'bg-amber-50 text-amber-600' },
   { id: 'Producción', icon: BookOpen, color: 'bg-sky-50 text-sky-600' }
]

const MONTHS = [
   "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
   "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export default function AcademicHistoryClient({ history, user }: Props) {
   const [activeTab, setActiveTab] = useState('Producción')
   const [loading, setLoading] = useState(false)
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [selectedItemToEdit, setSelectedItemToEdit] = useState<any>(null)
   const [selectedItemToSubmit, setSelectedItemToSubmit] = useState<any>(null)

   // Sum points per type (Decreto 1279 logic)
   const stats = {
      titulos: history.filter(h => h.type === 'TITULO' && h.status === 'APROBADO').reduce((acc, h) => acc + (h.points || 0), 0),
      produccion: history.filter(h => h.type === 'PRODUCCION' && h.status === 'APROBADO').reduce((acc, h) => acc + (h.points || 0), 0),
      experiencia: history.filter(h => h.type === 'EXPERIENCIA' && h.status === 'APROBADO').reduce((acc, h) => acc + (h.points || 0), 0),
      categoria: history.filter(h => h.type === 'CATEGORIA' && h.status === 'APROBADO').reduce((acc, h) => acc + (h.points || 0), 0)
   }

   const totalPoints = stats.titulos + stats.produccion + stats.experiencia + stats.categoria;
   const POINT_VALUE_2026 = 23924;
   const estimatedSalary = totalPoints * POINT_VALUE_2026;

   const filteredItems = history.filter(item => {
      if (activeTab === 'Títulos') return item.type === 'TITULO'
      if (activeTab === 'Categoría') return item.type === 'CATEGORIA'
      if (activeTab === 'Experiencia') return item.type === 'EXPERIENCIA'
      if (activeTab === 'Producción') return item.type === 'PRODUCCION'
      return true
   })

   function handleSendCiarp(item: any) {
      setSelectedItemToSubmit(item)
   }

   function handleEdit(item: any) {
      setSelectedItemToEdit(item)
      setIsModalOpen(true)
   }

   const generatePDF = async () => {
      try {
         setLoading(true);
         const { default: jsPDF } = await import('jspdf');
         const { default: autoTable } = await import('jspdf-autotable');

         const doc = new jsPDF() as any;

         // Cover / Header
         doc.setFillColor(15, 23, 42); // slate-900
         doc.rect(0, 0, 210, 40, 'F');

         doc.setTextColor(255, 255, 255);
         doc.setFontSize(22);
         doc.text("SIGAI - Historia Laboral y Perfil Académico", 14, 25);

         // Profile Zone
         doc.setTextColor(50, 50, 50);
         doc.setFontSize(14);
         doc.setFont("helvetica", "bold");
         doc.text(`Docente: ${user.fullName}`, 14, 52);

         doc.setFontSize(10);
         doc.setFont("helvetica", "normal");
         let startY = 58;
         doc.text(`ID: ${user.identification || ''} | Correo: ${user.email}`, 14, startY); startY += 6;

         const facultyStr = (typeof user.profile?.faculty === 'object' && user.profile.faculty?.name) ? user.profile.faculty.name : 'No registrada';
         const programStr = (typeof user.profile?.program === 'object' && user.profile.program?.name) ? user.profile.program.name : 'No registrado';

         doc.text(`Facultad: ${facultyStr} | Programa: ${programStr}`, 14, startY); startY += 6;
         doc.text(`Contrato: ${user.profile?.contractType || 'N/A'} (Desde ${user.profile?.joiningMonth || ''} ${user.profile?.joiningYear || ''})`, 14, startY); startY += 6;

         doc.setFont("helvetica", "bold");
         doc.text("Perfil Investigador", 14, startY + 4); startY += 10;
         doc.setFont("helvetica", "normal");

         doc.text(`Categoría Minciencias: ${user.profile?.mincienciasCategory || 'N/A'}`, 14, startY); startY += 6;

         if (user.profile?.researchAreas?.length) {
            const areasText = `Líneas de Investigación: ${user.profile.researchAreas.join(', ')}`;
            const areasLines = doc.splitTextToSize(areasText, 140);
            doc.text(areasLines, 14, startY);
            startY += (areasLines.length * 5) + 1;
         }

         if (user.profile?.researchGroups?.length) {
            const groupNames = user.profile.researchGroups.map((g: any) => typeof g === 'object' ? g.name : g).join(', ');
            const groupLines = doc.splitTextToSize(`Grupos de Investigación: ${groupNames}`, 140);
            doc.text(groupLines, 14, startY);
            startY += (groupLines.length * 5) + 1;
         }

         if (user.profile?.biography) {
            const bioText = user.profile.biography.replace(/\n/g, ' ');
            const bioLines = doc.splitTextToSize(`Bio: ${bioText}`, 140);
            doc.text(bioLines, 14, startY);
            startY += (bioLines.length * 5) + 2;
         }

         // Avatar Integration
         const imgUrl = user.profile?.profilePicture || user.profile?.imageUrl;
         if (imgUrl) {
            try {
               const imgData = await new Promise<string>((resolve, reject) => {
                  const img = new Image();
                  img.crossOrigin = 'Anonymous';
                  img.onload = () => {
                     const canvas = document.createElement('canvas');
                     canvas.width = img.width; canvas.height = img.height;
                     const ctx = canvas.getContext('2d');
                     ctx?.drawImage(img, 0, 0);
                     resolve(canvas.toDataURL('image/jpeg'));
                  };
                  img.onerror = reject;
                  img.src = imgUrl;
               });
               doc.addImage(imgData, 'JPEG', 160, 48, 30, 33);
            } catch (err) {
               console.warn("Avatar could not be loaded for PDF, skipping.", err);
            }
         }

         startY += 5;

         // Títulos
         const titulos = history.filter(h => h.type === 'TITULO' && h.status === 'APROBADO').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
         if (titulos.length > 0) {
            autoTable(doc, {
               startY: startY,
               head: [['Título Adquirido', 'Institución / Detalle', 'Año']],
               body: titulos.map(i => [i.title, i.institution || i.subtype, new Date(i.date).getFullYear().toString()]),
               theme: 'striped',
               headStyles: { fillColor: [4, 120, 87] },
               styles: { fontSize: 8 }
            });
            startY = doc.lastAutoTable.finalY + 15;
         }

         // Experiencia
         const experiencia = history.filter(h => h.type === 'EXPERIENCIA' && h.status === 'APROBADO').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
         if (experiencia.length > 0) {
            autoTable(doc, {
               startY: startY,
               head: [['Cargo / Experiencia', 'Institución', 'Año']],
               body: experiencia.map(i => [i.title, i.institution || i.subtype, new Date(i.date).getFullYear().toString()]),
               theme: 'striped',
               headStyles: { fillColor: [217, 119, 6] },
               styles: { fontSize: 8 }
            });
            startY = doc.lastAutoTable.finalY + 15;
         }

         // Producción (Bibliográfica format)
         const produccion = history.filter(h => h.type === 'PRODUCCION' && h.status === 'APROBADO').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
         if (produccion.length > 0) {
            const refBody = produccion.map(i => {
               const year = new Date(i.date).getFullYear();
               const authors = i.totalAuthors > 1 ? `${user.fullName} et al.` : user.fullName;
               // Formato APA simplificado
               const titleStr = `${authors} (${year}). ${i.title}. ${i.subtype} - ${i.institution || ''}.`;
               return [titleStr];
            });
            autoTable(doc, {
               startY: startY,
               head: [['Referencias Bibliográficas de Producción Científica']],
               body: refBody,
               theme: 'plain',
               headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold' },
               styles: { fontSize: 9, cellPadding: 4 },
               alternateRowStyles: { fillColor: [248, 250, 252] }
            });
         }

         doc.save(`Historia_Laboral_${user.identification || 'Docente'}_SIGAI.pdf`);
      } catch (e) {
         console.error("PDF Error:", e);
         alert('Hubo un error al generar el PDF.');
      } finally {
         setLoading(false);
      }
   }

   return (
      <div className="space-y-6">
         <DashboardHeader
            user={user}
            breadcrumbs={[
               { label: 'Dashboard', href: '/dashboard' },
               { label: 'Historia Docente', active: true }
            ]}
         />

         {/* Header & Nav */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-serif text-slate-800 tracking-tight italic">Evolución de Carrera</h1>
               <p className="text-slate-400 mt-1 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Registro sistémico de méritos académicos, producción intelectual y experiencia calificada.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
               <Button
                  onClick={generatePDF}
                  variant="outline"
                  disabled={loading}
                  className="h-12 px-6 rounded-2xl border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-bold uppercase tracking-widest text-[9px] shadow-sm"
               >
                  <Download className="mr-2 h-4 w-4" /> {loading ? 'Generando...' : 'Generar PDF Historia'}
               </Button>
               <Button
                  onClick={() => setIsModalOpen(true)}
                  disabled={loading}
                  className="h-12 px-6 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-200"
               >
                  <Plus className="mr-2 h-4 w-4" /> Registrar Nuevo Mérito
               </Button>
            </div>
         </div>

         {/* Point Summary Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
               { label: 'CATEGORÍA', val: stats.categoria, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
               { label: 'TÍTULOS', val: stats.titulos, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
               { label: 'EXPERIENCIA', val: stats.experiencia, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50/50' },
               { label: 'PRODUCCIÓN', val: stats.produccion, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50/50' }
            ].map((card, i) => (
               <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm group hover:shadow-xl hover:shadow-slate-100 transition-all duration-500"
               >
                  <div className={cn("h-12 w-12 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110 duration-500", card.bg, card.color)}>
                     <card.icon className="h-6 w-6" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
                  <div className="flex items-baseline gap-2">
                     <h4 className="text-4xl font-serif text-slate-800 italic">{card.val}</h4>
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">pts</span>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Main Content Area */}
         <div className="bg-white rounded-[3rem] border border-slate-50 shadow-sm p-4 min-h-[500px]">
            <div className="grid grid-cols-1 lg:grid-cols-12">
               {/* Section Tabs (Left) */}
               <div className="lg:col-span-3 lg:border-r border-slate-50 p-6 space-y-2">
                  {TABS.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                           "w-full flex items-center justify-between p-5 rounded-3xl transition-all duration-500 group",
                           activeTab === tab.id
                              ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                        )}
                     >
                        <div className="flex items-center gap-4">
                           <div className={cn("h-9 w-9 rounded-2xl flex items-center justify-center transition-colors", activeTab === tab.id ? "bg-white/10" : "bg-slate-50 group-hover:bg-white")}>
                              <tab.icon className="h-4 w-4" />
                           </div>
                           <span className="text-xs font-bold uppercase tracking-widest">{tab.id}</span>
                        </div>
                        <ChevronRight className={cn("h-4 w-4 transition-transform", activeTab === tab.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
                     </button>
                  ))}

                  <div className="mt-12 bg-emerald-50 rounded-[2rem] p-8">
                     <Calculator className="h-8 w-8 text-emerald-600 mb-4" />
                     <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-widest mb-2 italic">Estimador Decreto 1279</h5>
                     <p className="text-[10px] text-emerald-700/70 leading-relaxed font-medium mb-4">Sus puntos actuales equivalen a un ajuste salarial aproximado según el valor del punto vigente (2026: $23.924).</p>
                     
                     <div className="bg-white/60 rounded-xl p-4 border border-emerald-100/50 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest flex justify-between items-center">
                           Fórmula
                           <span className="bg-emerald-100 px-1.5 py-0.5 rounded-sm">{totalPoints} pts</span>
                        </span>
                        <span className="text-2xl font-serif text-emerald-800 italic">
                           {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(estimatedSalary)}
                        </span>
                     </div>
                  </div>
               </div>

               {/* List Area (Right) */}
               <div className="lg:col-span-9 p-8">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                     <h3 className="text-xl font-serif text-slate-800 italic">{activeTab} Registrados</h3>
                     <div className="flex items-center gap-4">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Filtrar por Status</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {filteredItems.length === 0 ? (
                        <div className="h-60 flex flex-col items-center justify-center text-slate-200">
                           <FileText className="h-16 w-16 mb-4 opacity-20" />
                           <p className="text-[10px] font-bold uppercase tracking-widest">No hay registros en esta categoría</p>
                        </div>
                     ) : (
                        filteredItems.map((item, idx) => (
                           <motion.div
                              key={item._id}
                              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                              className="group bg-slate-50/50 hover:bg-white rounded-3xl p-6 border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-500 overflow-hidden relative"
                           >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                 <div className="flex items-start gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-white flex flex-col items-center justify-center shadow-sm border border-slate-100/50">
                                       <span className="text-[10px] font-bold text-primary leading-none">{new Date(item.date).getFullYear()}</span>
                                       <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mt-1">{MONTHS[new Date(item.date).getMonth()].substring(0, 3)}</span>
                                    </div>
                                    <div>
                                       <h4 className="font-serif text-slate-800 text-lg group-hover:text-primary transition-colors leading-tight mb-1">{item.title}</h4>
                                       <div className="flex flex-wrap items-center gap-3 mb-2">
                                          <span className="text-[10px] font-bold text-slate-400">{item.subtype}</span>
                                          <span className="text-slate-200">|</span>
                                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.institution}</span>
                                       </div>
                                       <div className="flex flex-wrap items-center gap-4 mt-3">
                                          {(item.metadata?.url || item.metadata?.productUrl) && (
                                             <a href={item.metadata?.url || item.metadata?.productUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[9px] font-bold text-sky-500 uppercase tracking-widest hover:text-sky-600 transition-colors">
                                                <ExternalLink className="h-3 w-3" /> Ver
                                             </a>
                                          )}
                                          {item.status !== 'REGISTRADO' && item.metadata?.submissionData?.evidence && Object.entries(item.metadata.submissionData.evidence).map(([k, v]) => (
                                             <a key={k} href={v as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                                                <FileText className="h-3 w-3" /> {k.length > 20 ? k.substring(0, 20) + '...' : k}
                                             </a>
                                          ))}
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-6">
                                    <div className="text-right">
                                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">Puntos</p>
                                       <p className="text-2xl font-serif text-slate-800 italic">{item.points || '0'}</p>
                                    </div>

                                    <div className="flex flex-col items-center gap-1.5">
                                       <div className={cn(
                                          "px-4 py-2 rounded-2xl border text-[9px] font-bold uppercase tracking-[0.1em] flex items-center gap-2",
                                          item.status === 'APROBADO' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                             item.status === 'ENVIADO_CIARP' ? "bg-sky-50 text-sky-700 border-sky-100 animate-pulse" :
                                                item.status === 'RECHAZADO' ? "bg-red-50 text-red-700 border-red-100" :
                                                   "bg-slate-100 text-slate-500 border-slate-200"
                                       )}>
                                          {item.status === 'APROBADO' ? <CheckCircle className="h-3 w-3" /> :
                                             item.status === 'ENVIADO_CIARP' ? <Clock className="h-3 w-3" /> :
                                                item.status === 'RECHAZADO' ? <AlertCircle className="h-3 w-3" /> :
                                                   <Plus className="h-3 w-3" />}
                                          {item.status.replace(/_/g, ' ')}
                                       </div>
                                       {item.status === 'ENVIADO_CIARP' && item.metadata?.sentAt && (
                                          <div className="text-[8px] font-bold text-slate-400 flex items-center gap-1">
                                             <span className="opacity-50 tracking-tighter uppercase whitespace-nowrap">Fecha de Envío:</span>
                                             <span className="text-slate-500">{new Date(item.metadata.sentAt).toLocaleDateString()}</span>
                                          </div>
                                       )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                       {item.status === 'REGISTRADO' && (
                                          <div className="flex items-center gap-2">
                                             <button
                                                onClick={() => handleEdit(item)}
                                                disabled={loading}
                                                className="h-10 w-10 rounded-xl bg-white text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-primary transition-all border border-slate-100 shadow-sm"
                                                title="Editar"
                                             >
                                                <Pencil className="h-4 w-4" />
                                             </button>
                                             <button
                                                onClick={() => handleSendCiarp(item)}
                                                disabled={loading}
                                                className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-primary transition-all shadow-lg hover:shadow-primary/20"
                                                title="Enviar al CIARP"
                                             >
                                                <Send className="h-4 w-4" />
                                             </button>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        ))
                     )}
                  </div>
               </div>
            </div>
         </div>

         <MeritRegistrationModal
            isOpen={isModalOpen}
            onClose={() => { setIsModalOpen(false); setSelectedItemToEdit(null); }}
            user={user}
            initialItem={selectedItemToEdit}
         />

         <CiarpSubmissionModal
            isOpen={!!selectedItemToSubmit}
            onClose={() => setSelectedItemToSubmit(null)}
            item={selectedItemToSubmit}
         />
      </div>
   )
}
