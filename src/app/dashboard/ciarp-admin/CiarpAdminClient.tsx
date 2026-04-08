'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, FileText, ClipboardList, CheckCircle, 
  XCircle, Clock, Search, Filter, Eye, ExternalLink,
  Plus, Calendar, Mail, User, BookOpen, AlertCircle, Calculator,
  Hash, Save, ChevronRight, FileBadge, Check, Trash2,
  Settings, LayoutDashboard, Download, BarChart3,
  CheckCircle2, AlertTriangle, Layers, ShieldCheck,
  TrendingUp, Zap, Award, Flame, LogOut, Upload
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import { logoutAction } from '@/lib/actions/auth-actions'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
// Import server actions (Need to ensure these exist)
import { createActa, updateActa, evaluateSubmission, bulkEvaluateSubmissions, getPendingJournals, validateJournalInActa } from "@/lib/actions/ciarp-actions"
import { uploadFile } from '@/lib/actions/storage-actions'
import { calculateCumulativeTitlePoints } from "@/lib/utils/decreto-1279"

interface Props {
  user: {
    fullName: string;
    email: string;
    role: string;
  };
  data: {
    pendingSubmissions: any[],
    addressedSubmissions: any[],
    lecturers: any[],
    actas: any[]
  }
}

type TabType = 'RADICACIONES' | 'ATENDIDAS' | 'SESIONES' | 'DOCENTES' | 'DASHBOARD';

export default function CiarpAdminClient({ data, user }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('RADICACIONES')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterRecognition, setFilterRecognition] = useState('ALL')
  const [analyticsYear, setAnalyticsYear] = useState('2025')
  const [analyticsFaculty, setAnalyticsFaculty] = useState('ALL')
  const [analyticsProgram, setAnalyticsProgram] = useState('ALL')
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [showActaModal, setShowActaModal] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState<any>(null)
  const [editingActa, setEditingActa] = useState<any>(null)
  const [showHandledDetails, setShowHandledDetails] = useState<any>(null)
  const [pendingJournals, setPendingJournals] = useState<any[] | null>(null)
  
  // New Acta state
  const [newActa, setNewActa] = useState({ number: '', date: '', agenda: '' })

  // Evaluation states
  const [evaluation, setEvaluation] = useState({ status: 'APROBADO', reason: '', actaId: '', points: 0 })

  const [journalUploading, setJournalUploading] = useState<Record<string, boolean>>({})
  const [journalEvidence, setJournalEvidence] = useState<Record<string, string>>({})

  const handleJournalFileUpload = async (jId: string, file: File) => {
    setJournalUploading(prev => ({ ...prev, [jId]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadFile(formData)
      if (res.success && res.url) {
        setJournalEvidence(prev => ({ ...prev, [jId]: res.url }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setJournalUploading(prev => ({ ...prev, [jId]: false }))
    }
  }

  const loadPendingJournals = async () => {
    const ids = data.pendingSubmissions.map(s => s._id);
    const actaId = editingActa?._id;
    const res = await getPendingJournals(ids, actaId);
    if(res.success) setPendingJournals(res.data);
  }

  const handleValidateJournal = async (jId: string, category: string) => {
    if (!editingActa) return;
    const evidenceUrl = journalEvidence[jId];
    if (!evidenceUrl) return alert("Debe adjuntar primero la evidencia fotográfica de la indexación para proceder.")
    const res = await validateJournalInActa(jId, editingActa._id, category, evidenceUrl);
    if(res.success) {
        setPendingJournals(prev => prev?.map(j => j._id === jId ? res.data : j) || null);
    } else {
        alert(res.error);
    }
  }

  const filteredSubmissions = useMemo(() => {
    return data.pendingSubmissions.filter(s => {
      const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.users?.[0]?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'ALL' || s.type === filterType;
      const matchRecognition = filterRecognition === 'ALL' || s.metadata?.submissionData?.recognitionType === filterRecognition;
      return matchSearch && matchType && matchRecognition;
    });
  }, [data.pendingSubmissions, searchTerm, filterType, filterRecognition]);

  const filteredHandled = useMemo(() => {
    return (data.addressedSubmissions || []).filter(s => {
      const matchSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.users?.[0]?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'ALL' || s.type === filterType;
      const matchRecognition = filterRecognition === 'ALL' || s.metadata?.submissionData?.recognitionType === filterRecognition;
      return matchSearch && matchType && matchRecognition;
    });
  }, [data.addressedSubmissions, searchTerm, filterType, filterRecognition]);

  const handleToggleSub = (id: string) => {
    setSelectedSubmissions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  const handleSelectAll = (e: any) => {
    if (e.target.checked) setSelectedSubmissions(filteredSubmissions.map(s => s._id));
    else setSelectedSubmissions([]);
  }

  async function onCreateActa() {
    if (!newActa.number || !newActa.date) return alert('Número y fecha son requeridos');
    const res = await createActa(newActa);
    if (res.success) {
      setShowActaModal(false);
      setNewActa({ number: '', date: '', agenda: '' });
      // In a real app, the server action would revalidate or we'd update state
    } else alert(res.error);
  }

  async function onUpdateActa() {
    if (!editingActa) return;
    const res = await updateActa(editingActa._id, editingActa);
    if (res.success) setEditingActa(null);
    else alert(res.error);
  }

  async function onToggleActaStatus() {
    if (!editingActa) return;
    const newStatus = editingActa.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    const res = await updateActa(editingActa._id, { status: newStatus });
    if (res.success) setEditingActa(null);
    else alert(res.error);
  }

  async function onEvaluate() {
     if (!evaluation.actaId) return alert('Debe seleccionar el Acta donde se tomó la decisión.');
     
     const subIds = showEvaluationModal === 'BULK' ? selectedSubmissions : [showEvaluationModal._id];
     
     const res = await bulkEvaluateSubmissions(subIds, evaluation);
     if (res.success) {
        setShowEvaluationModal(null);
        setSelectedSubmissions([]);
        setEvaluation({ status: 'APROBADO', reason: '', actaId: '', points: 0 });
     } else alert(res.error);
  }

  const stats = {
     pending: data.pendingSubmissions.length,
     lecturers: data.lecturers.length,
     actas: data.actas.length,
     approvedMonth: 12 // Simulated or could be calculated
  }

  const analytics = useMemo(() => {
    const handled = (data.addressedSubmissions || []).filter(s => {
      const matchYear = analyticsYear === 'ALL' || new Date(s.updatedAt).getFullYear().toString() === analyticsYear;
      const t = s.users?.[0];
      const matchFaculty = analyticsFaculty === 'ALL' || 
          (t?.profile?.faculty && (t.profile.faculty._id === analyticsFaculty || t.profile.faculty === analyticsFaculty));
      const matchProgram = analyticsProgram === 'ALL' || t?.profile?.program === analyticsProgram;
      return matchYear && matchFaculty && matchProgram;
    });

    const teacherSet = new Set(handled.map(s => s.users?.[0]?._id));
    const totalTeachers = teacherSet.size;
    const itemsCount = handled.length;
    
    // Top Teachers
    const teacherMap: Record<string, { name: string, count: number, points: number }> = {};
    handled.forEach(s => {
      const u = s.users?.[0];
      if (!u) return;
      if (!teacherMap[u._id]) teacherMap[u._id] = { name: u.fullName, count: 0, points: 0 };
      teacherMap[u._id].count++;
      teacherMap[u._id].points += (s.status === 'APROBADO' ? s.points || 0 : 0);
    });
    const topTeachers = Object.values(teacherMap).sort((a,b) => b.count - a.count).slice(0, 5);

    // Points Breakdown
    let salaryPoints = 0;
    let bonusPoints = 0;
    const approved = handled.filter(s => s.status === 'APROBADO');
    approved.forEach(s => {
      if (s.metadata?.submissionData?.recognitionType === 'PUNTOS') salaryPoints += (s.points || 0);
      else bonusPoints += (s.points || 0);
    });

    // Content types and Journals
    const typesMap: Record<string, number> = {};
    const journalsMap: Record<string, number> = {};
    approved.forEach(s => {
      typesMap[s.subtype] = (typesMap[s.subtype] || 0) + 1;
      if (s.metadata?.journalName) {
         const name = s.metadata.journalName.trim();
         if (name && name !== '---') journalsMap[name] = (journalsMap[name] || 0) + 1;
      }
    });
    const topTypes = Object.entries(typesMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const topJournals = Object.entries(journalsMap).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

    const POINT_VALUE = 23924;
    const economicImpact = (salaryPoints + bonusPoints) * POINT_VALUE;

    return {
      totalTeachers,
      avgPerTeacher: totalTeachers > 0 ? (itemsCount / totalTeachers).toFixed(1) : 0,
      salaryPoints,
      bonusPoints,
      economicImpact,
      topTeachers,
      topTypes,
      topJournals,
      totalApproved: approved.length
    };
  }, [data.addressedSubmissions, analyticsYear, analyticsFaculty, analyticsProgram]);

  const exportToExcel = (handledData: any[]) => {
     // Create simple CSV content that Excel can open
     const headers = ["Fecha", "Docente", "ID", "Tipo", "Titulo", "Solicitado", "Aprobado", "Decision", "Acta"];
     const rows = [
       headers.join(","),
       ...handledData.map(s => [
         new Date(s.updatedAt).toLocaleDateString(),
         s.users?.[0]?.fullName,
         s.users?.[0]?.identification,
         s.subtype,
         `"${s.title.replace(/"/g, '""')}"`,
         s.requestedPoints || 0,
         s.points || 0,
         s.status,
         s.actaId?.number || 'S/N'
       ].join(","))
     ].join("\n");

     const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement("a");
     const url = URL.createObjectURL(blob);
     link.setAttribute("href", url);
     link.setAttribute("download", `CIARP_Reporte_${new Date().toISOString().split('T')[0]}.csv`);
     link.style.visibility = 'hidden';
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-white">
       {/* Global SIGAI Navigation Header */}
       <div className="mx-auto max-w-7xl px-8 pt-8 pb-4">
          <DashboardHeader 
            user={user} 
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Comité CIARP', active: true }
            ]} 
          />
       </div>

       <div className="mx-auto max-w-7xl px-8 py-4 space-y-12">
      {/* Premium Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
           <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg">Panel Administrativo</span>
              <span>/</span>
              <span className="text-slate-500">Comité CIARP</span>
           </div>
           <h1 className="text-5xl font-serif text-slate-900 tracking-tight italic">Gestión de Méritos Docentes</h1>
           <p className="text-slate-400 mt-4 text-[10px] font-bold uppercase tracking-widest leading-relaxed flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Control Oficial Decreto 1279 — Sistema SIGAI
           </p>
        </div>

        <div className="flex items-center gap-4">
           <Button 
            onClick={() => setShowActaModal(true)}
            className="h-14 px-8 rounded-3xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 flex items-center gap-3 group"
           >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" /> Iniciar Sesión (Nueva Acta)
           </Button>
        </div>
      </div>

      {/* Admin Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Radicaciones Pendientes', val: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/50' },
           { label: 'Docentes Registrados', val: stats.lecturers, icon: Users, color: 'text-sky-600', bg: 'bg-sky-100/50' },
           { label: 'Sesiones de Comité', val: stats.actas, icon: ClipboardList, color: 'text-indigo-600', bg: 'bg-indigo-100/50' },
           { label: 'Méritos Mes Actual', val: stats.approvedMonth, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100/50' }
         ].map((card, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
             className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm flex flex-col items-start gap-4"
           >
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", card.bg, card.color)}>
                 <card.icon className="h-5 w-5" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                 <h4 className="text-3xl font-serif text-slate-900 italic">{card.val}</h4>
              </div>
           </motion.div>
         ))}
      </div>

      {/* Main Control Panel */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[600px]">
         {/* Internal Navigation */}
         <div className="p-2 bg-slate-50/50 border-b border-slate-50 flex items-center justify-center gap-2">
            {[
              { id: 'RADICACIONES', label: 'Solicitudes Pendientes', icon: LayoutDashboard },
              { id: 'ATENDIDAS', label: 'Solicitudes Atendidas', icon: CheckCircle2 },
              { id: 'SESIONES', label: 'Actas de Sesión', icon: ClipboardList },
              { id: 'DOCENTES', label: 'Censo Docente', icon: Users },
              { id: 'DASHBOARD', label: 'Analíticas', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "px-8 py-4 rounded-[2rem] text-[9px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all duration-500",
                  activeTab === tab.id ? "bg-white text-slate-900 shadow-lg shadow-slate-100" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
         </div>

         {/* Tab Content */}
         <div className="p-10 grow flex flex-col">
            <AnimatePresence mode="wait">
               {activeTab === 'RADICACIONES' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 flex-col flex grow">
                    {/* Filters & Bulk Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-4 grow max-w-2xl">
                          <div className="relative grow">
                             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                             <input 
                              type="text" 
                              placeholder="Buscar por título del producto o nombre del docente..." 
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              className="w-full h-14 pl-14 pr-6 rounded-[2rem] bg-slate-50 border-none text-[11px] font-medium text-slate-600 focus:ring-2 ring-primary/20 placeholder:text-slate-300 transition-all shadow-inner"
                             />
                          </div>
                          <select 
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="h-14 px-8 rounded-[2rem] bg-slate-50 border-none text-[11px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:ring-2 ring-primary/20 shadow-inner"
                          >
                             <option value="ALL">Todo Tipo</option>
                             <option value="TITULO">Títulos</option>
                             <option value="EXPERIENCIA">Experiencia</option>
                             <option value="PRODUCCION">Producción</option>
                          </select>
                          <select 
                            value={filterRecognition}
                            onChange={e => setFilterRecognition(e.target.value)}
                            className="h-14 px-8 rounded-[2rem] bg-slate-50 border-none text-[11px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:ring-2 ring-primary/20 shadow-inner"
                          >
                             <option value="ALL">Todo Reconocimiento</option>
                             <option value="SALARIAL">Puntos Salariales</option>
                             <option value="BONIFICACION">Bonificación</option>
                          </select>
                       </div>

                       {selectedSubmissions.length > 0 && (
                         <div className="flex items-center gap-3 animate-in slide-in-from-right-10">
                            <span className="text-[10px] font-bold text-primary mr-2 uppercase tracking-widest">{selectedSubmissions.length} Seleccionados</span>
                            <Button onClick={() => setShowEvaluationModal('BULK')} className="h-12 px-6 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-200">
                               Decisión Grupal
                            </Button>
                         </div>
                       )}
                    </div>

                    {/* Submissions Table - High Density version based on Institutional Spreadsheet */}
                    <div className="rounded-[2.5rem] border border-slate-50 overflow-x-auto grow shadow-inner bg-slate-50/20">
                       <table className="w-full text-left border-collapse min-w-[1400px]">
                          <thead className="bg-white border-b border-slate-100">
                             <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                <th className="p-4 text-center w-12 sticky left-0 bg-white z-10">
                                   <input type="checkbox" onChange={handleSelectAll} checked={selectedSubmissions.length === filteredSubmissions.length && filteredSubmissions.length > 0} className="rounded border-slate-300 accent-primary" />
                                </th>
                                <th className="p-4 w-24">Fecha</th>
                                <th className="p-4 w-48">Docente</th>
                                <th className="p-4 w-72">Título Artículo / Producto</th>
                                <th className="p-4 text-center w-16 text-primary">Año</th>
                                <th className="p-4 text-center w-16">Mes</th>
                                <th className="p-4 w-40">Revista</th>
                                <th className="p-4 w-32">ISSN</th>
                                <th className="p-4 text-center w-12">Nº</th>
                                <th className="p-4 text-center w-12">Vol</th>
                                <th className="p-4 text-center w-24">Cat. Solicitada</th>
                                <th className="p-4 text-center w-24">Cat. CIARP</th>
                                <th className="p-4 text-center w-20">Puntos</th>
                                <th className="p-4 text-center w-16">Autores</th>
                                <th className="p-4 text-right w-24">Acción</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {filteredSubmissions.map((sub, idx) => (
                               <tr key={sub._id} className="group hover:bg-white transition-all">
                                  <td className="p-4 text-center sticky left-0 bg-white/80 backdrop-blur-sm group-hover:bg-white z-10">
                                     <input 
                                      type="checkbox" 
                                      checked={selectedSubmissions.includes(sub._id)}
                                      onChange={() => handleToggleSub(sub._id)}
                                      className="rounded border-slate-300 accent-primary" 
                                     />
                                  </td>
                                  <td className="p-4">
                                     <div className="text-[10px] font-bold text-slate-500">{new Date(sub.createdAt).toLocaleDateString()}</div>
                                     <div className="text-[8px] text-slate-300 mt-0.5">{sub.metadata?.submissionData?.recognitionType === 'BONIFICACION' ? 'Bono' : 'Salarial'}</div>
                                  </td>
                                  <td className="p-4">
                                     <div className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[180px]" title={sub.users?.[0]?.fullName}>
                                        {sub.users?.[0]?.fullName}
                                     </div>
                                     <div className="text-[9px] text-slate-400 italic">ID: {sub.users?.[0]?.identification || '---'}</div>
                                  </td>
                                  <td className="p-4">
                                     <div className="text-[10px] font-bold text-slate-600 leading-tight line-clamp-2" title={sub.title}>{sub.title}</div>
                                     <div className="flex items-center gap-2 mt-2">
                                        <a href={sub.metadata?.link || `https://doi.org/${sub.metadata?.doi}`} target="_blank" rel="noreferrer" className="text-[8px] font-black uppercase text-sky-500 hover:underline flex items-center gap-1">
                                           Link <ExternalLink className="h-2 w-2" />
                                        </a>
                                        {Object.entries(sub.metadata?.submissionData?.evidence || {}).map(([key, url]: [string, any], i) => (
                                          <a key={i} href={url} target="_blank" rel="noreferrer" className="text-[8px] font-black uppercase text-primary/60 hover:text-primary flex items-center gap-1 border-l border-slate-200 pl-2">
                                             Doc {i+1}
                                          </a>
                                        ))}
                                     </div>
                                  </td>
                                  <td className="p-4 text-center text-[10px] font-bold text-slate-900">{sub.metadata?.year || (sub.date ? new Date(sub.date).getFullYear() : '---')}</td>
                                  <td className="p-4 text-center text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{sub.metadata?.month || '---'}</td>
                                  <td className="p-4">
                                     <div className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]" title={sub.metadata?.journalName}>
                                        {sub.metadata?.journalName || '---'}
                                     </div>
                                  </td>
                                  <td className="p-4 text-[10px] font-mono text-slate-400">{sub.metadata?.issn || '---'}</td>
                                  <td className="p-4 text-center text-[10px] text-slate-500">{sub.metadata?.issue || '---'}</td>
                                  <td className="p-4 text-center text-[10px] text-slate-500">{sub.metadata?.volume || '---'}</td>
                                  <td className="p-4 text-center">
                                     <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border bg-slate-100 text-slate-500 border-slate-200">
                                        {sub.metadata?.journalCategory || '---'}
                                     </span>
                                  </td>
                                  <td className="p-4 text-center">
                                     {sub.validatedCategory ? (
                                        <div className="flex flex-col items-center">
                                           <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border bg-emerald-500 text-white border-emerald-600 shadow-sm">
                                              {sub.validatedCategory}
                                           </span>
                                           <div className="text-[6.5px] text-emerald-600 font-bold uppercase mt-1 tracking-widest text-center">Homologada</div>
                                        </div>
                                     ) : (
                                        <span className="text-[9px] text-slate-300 italic font-medium">En espera</span>
                                     )}
                                  </td>
                                  <td className="p-4 text-center">
                                     <div className="text-[11px] font-black text-emerald-600">{sub.points || '0'}</div>
                                  </td>
                                  <td className="p-4 text-center text-[10px] font-bold text-slate-400">{sub.totalAuthors || '1'}</td>
                                  <td className="p-4 text-right">
                                     <Button 
                                      onClick={() => {
                                        setEvaluation({ status: 'APROBADO', reason: '', actaId: '', points: sub.points || 0 });
                                        setShowEvaluationModal(sub);
                                      }}
                                      className="h-9 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-[8px] hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                     >
                                        Decidir
                                     </Button>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </motion.div>
               )}
               {activeTab === 'ATENDIDAS' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 flex-col flex grow">
                     {/* Filters (Borrowed from Radicaciones) */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center gap-4 grow max-w-2xl">
                          <div className="relative grow">
                             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                             <input 
                              type="text" 
                              placeholder="Buscar solicitudes atendidas..." 
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              className="w-full h-14 pl-14 pr-6 rounded-[2rem] bg-slate-50 border-none text-[11px] font-medium text-slate-600 focus:ring-2 ring-primary/20 placeholder:text-slate-300 transition-all shadow-inner"
                             />
                          </div>
                          <Button onClick={() => exportToExcel(filteredHandled)} className="h-14 px-8 rounded-3xl bg-emerald-600 text-white font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-200 flex items-center gap-2 group">
                             <Download className="h-4 w-4 group-hover:translate-y-1 transition-transform" /> Exportar a Excel (CSV)
                          </Button>
                       </div>
                    </div>

                    <div className="rounded-[2.5rem] border border-slate-50 overflow-x-auto grow shadow-inner bg-slate-50/20">
                       <table className="w-full text-left border-collapse min-w-[1300px]">
                          <thead className="bg-white border-b border-slate-100">
                             <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                <th className="p-6">Fecha CIARP</th>
                                <th className="p-6">Docente</th>
                                <th className="p-6 w-80">Producto Atendido</th>
                                <th className="p-6 text-center">Decisión</th>
                                <th className="p-6 text-center text-slate-400">Solicitado</th>
                                <th className="p-6 text-center text-primary font-black">Aprobado</th>
                                <th className="p-6 text-center">Nº Acta</th>
                                <th className="p-6 text-right">Detalle</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {filteredHandled.map((sub: any) => (
                               <tr key={sub._id} className="group hover:bg-white transition-all">
                                  <td className="p-6">
                                     <div className="text-[10px] font-bold text-slate-500">{new Date(sub.updatedAt).toLocaleDateString()}</div>
                                     <div className="text-[8px] text-slate-300 mt-0.5">Finalizado</div>
                                  </td>
                                  <td className="p-6">
                                     <div className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[150px]">
                                        {sub.users?.[0]?.fullName}
                                     </div>
                                  </td>
                                  <td className="p-6">
                                     <div className="text-[10px] font-bold text-slate-600 leading-tight mb-2 truncate max-w-[300px]">{sub.title}</div>
                                     <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[8px] font-black text-slate-400 uppercase">{sub.subtype}</span>
                                     </div>
                                  </td>
                                  <td className="p-6 text-center">
                                     <span className={cn(
                                       "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                       sub.status === 'APROBADO' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                       sub.status === 'APLAZADO' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                       "bg-red-50 text-red-600 border-red-100"
                                     )}>
                                        {sub.status}
                                     </span>
                                  </td>
                                  <td className="p-6 text-center">
                                     <div className="text-lg font-serif italic text-slate-400">{sub.requestedPoints || '0'}</div>
                                  </td>
                                  <td className="p-6 text-center">
                                     <div className="text-xl font-serif italic font-black text-emerald-600">{sub.points || '0'}</div>
                                  </td>
                                  <td className="p-6 text-center">
                                     <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold text-slate-900">{sub.actaId?.number || 'S/N'}</span>
                                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">Acta Oficial</span>
                                     </div>
                                  </td>
                                  <td className="p-6 text-right">
                                     <Button 
                                      onClick={() => setShowHandledDetails(sub)}
                                      variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100"><Eye className="h-4 w-4 text-slate-400" />
                                     </Button>
                                  </td>
                               </tr>
                             ))}
                              {filteredHandled.length === 0 && (
                                <tr>
                                   <td colSpan={7} className="p-20 text-center text-slate-300 italic text-[11px]">No se han procesado solicitudes todavía.</td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'SESIONES' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                     <div className="flex items-center justify-between mb-4 px-4">
                         <h4 className="text-xl font-serif text-slate-800 italic">Historial de Actas CIARP</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.actas.length} Sesiones registradas</p>
                     </div>
                     <div className="space-y-3">
                        {data.actas.map((acta, idx) => (
                          <div key={idx} className="bg-white rounded-[2rem] p-4 border border-slate-50 shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-6">
                              <div className="flex items-center gap-6 grow">
                                 <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                    <FileText className="h-5 w-5" />
                                 </div>
                                 <div className="min-w-[120px]">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Nº Acta</p>
                                    <h5 className="text-[11px] font-black text-slate-800">{acta.number}</h5>
                                 </div>
                                 <div className="min-w-[150px]">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fecha Sesión</p>
                                    <h5 className="text-[11px] font-bold text-slate-600 italic">
                                       {new Date(acta.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </h5>
                                 </div>
                                 <div className="grow hidden lg:block">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Resumen Agenda</p>
                                    <p className="text-[10px] text-slate-500 truncate max-w-sm">{acta.agenda || 'Sin observaciones adicionales'}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6 shrink-0">
                                 <span className={cn(
                                   "px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                   acta.status === 'OPEN' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200 shadow-inner"
                                 )}>
                                    {acta.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                                 </span>
                                 <Button 
                                  onClick={() => setEditingActa(acta)}
                                  variant="ghost" 
                                  className="h-10 px-6 rounded-xl border border-slate-100 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 group hover:bg-slate-900 hover:text-white transition-all"
                                 >
                                    Editar <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                 </Button>
                              </div>
                          </div>
                        ))}
                        {data.actas.length === 0 && (
                          <div className="p-20 text-center text-slate-300 italic text-[11px] bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                             No hay actas registradas en el sistema todavía.
                          </div>
                        )}
                     </div>
                  </motion.div>
               )}

               {activeTab === 'DASHBOARD' && (
                 <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-20">
                    {/* Analytics Header & Filters */}
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-slate-200">
                       <div className="space-y-2">
                          <h4 className="text-3xl font-serif italic font-light tracking-tight">Reporte de Impacto Academia</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                             <Calculator className="h-4 w-4 text-emerald-400" /> Valor Punto 2025: <span className="text-white">$23,924</span>
                          </p>
                       </div>
                       <div className="flex flex-wrap items-center gap-4">
                          <select 
                            value={analyticsYear} 
                            onChange={e => setAnalyticsYear(e.target.value)}
                            className="h-12 px-6 rounded-2xl bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:ring-2 ring-emerald-500/50"
                          >
                             <option className="text-slate-900" value="ALL">Histórico</option>
                             <option className="text-slate-900" value="2025">2025</option>
                             <option className="text-slate-900" value="2024">2024</option>
                          </select>
                          <select 
                             value={analyticsFaculty} 
                             onChange={e => setAnalyticsFaculty(e.target.value)}
                             className="h-12 px-6 rounded-2xl bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white outline-none focus:ring-2 ring-emerald-500/50"
                           >
                              <option className="text-slate-900" value="ALL">Todas las Facultades</option>
                              {[...new Map(data.lecturers.map(l => {
                                 const f = l.profile?.faculty;
                                 if (!f) return null;
                                 return [f._id || f, f.name || f];
                              }).filter(Boolean) as [string, string][]).entries()].map(([id, name]) => (
                                <option className="text-slate-900" key={id} value={id}>{name}</option>
                              ))}
                           </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-4">
                          <div className="h-14 w-14 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-black"><Users className="h-6 w-6" /></div>
                          <div>
                             <h6 className="text-3xl font-serif italic text-slate-900">{analytics.totalTeachers}</h6>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Docentes Atendidos</p>
                          </div>
                          <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                             <span className="text-[8px] font-black text-slate-300 uppercase">Promedio Solicitud</span>
                             <span className="text-[10px] font-black text-indigo-600">{analytics.avgPerTeacher} item/doc</span>
                          </div>
                       </div>
                       <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-4">
                          <div className="h-14 w-14 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-black"><TrendingUp className="h-6 w-6" /></div>
                          <div>
                             <h6 className="text-3xl font-serif italic text-slate-900">{analytics.salaryPoints}</h6>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Puntos Salariales</p>
                          </div>
                          <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                             <span className="text-[8px] font-black text-slate-300 uppercase">Bonificaciones</span>
                             <span className="text-[10px] font-black text-emerald-600">{analytics.bonusPoints} pts</span>
                          </div>
                       </div>
                       <div className="bg-emerald-600 p-10 rounded-[2.5rem] shadow-xl text-white space-y-4">
                          <div className="h-14 w-14 rounded-3xl bg-white/20 text-white flex items-center justify-center font-black"><Zap className="h-6 w-6" /></div>
                          <div>
                             <h6 className="text-3xl font-serif italic">${(analytics.economicImpact || 0).toLocaleString()}</h6>
                             <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-widest">Impacto Presupuestal</p>
                          </div>
                          <p className="text-[8px] text-emerald-200 uppercase font-black">Proyección Anual CIARP</p>
                       </div>
                       <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-4">
                          <div className="h-14 w-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black"><Award className="h-6 w-6" /></div>
                          <div>
                             <h6 className="text-3xl font-serif italic text-slate-900">{analytics.totalApproved}</h6>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Aprobaciones</p>
                          </div>
                          <p className="text-[8px] text-slate-300 uppercase font-black italic">Evaluación Técnica de Méritos</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       <section className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm">
                          <h5 className="text-xl font-serif italic text-slate-800 mb-10 flex items-center gap-4">
                             <TrendingUp className="h-6 w-6 text-amber-500" /> Docentes con más solicitudes
                          </h5>
                          <div className="space-y-6">
                             {analytics.topTeachers.map((t, idx) => (
                               <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                                  <div className="flex items-center gap-4">
                                     <span className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-slate-300 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">{idx + 1}</span>
                                     <div>
                                        <p className="text-[11px] font-black text-slate-800 uppercase line-clamp-1">{t.name}</p>
                                        <p className="text-[8px] text-slate-400 font-bold tracking-widest">DOCENTE INVESTIGADOR</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-[11px] font-black text-slate-900">{t.count} items</p>
                                     <p className="text-[9px] text-emerald-500 font-serif italic">+{t.points} pts aprobados</p>
                                  </div>
                               </div>
                             ))}
                             {analytics.topTeachers.length === 0 && <p className="text-center text-slate-300 py-10 italic">Aún no hay radicaciones procesadas para mostrar ranking.</p>}
                          </div>
                       </section>

                       <section className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm">
                          <h5 className="text-xl font-serif italic text-slate-800 mb-10 flex items-center gap-4">
                             <BarChart3 className="h-6 w-6 text-indigo-500" /> Lo más aprobado (Subtipos)
                          </h5>
                          <div className="space-y-10 pt-4">
                             {analytics.topTypes.map(([type, count]) => (
                               <div key={type} className="space-y-4">
                                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                     <span className="text-slate-500">{type}</span>
                                     <span className="text-slate-900">{count} Aprobaciones</span>
                                  </div>
                                  <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner">
                                     <motion.div 
                                       initial={{ width: 0 }} 
                                       animate={{ width: `${(count / (analytics.totalApproved || 1)) * 100}%` }}
                                       className="h-full bg-indigo-500 rounded-full shadow-lg shadow-indigo-100"
                                     />
                                  </div>
                               </div>
                             ))}
                             {analytics.topTypes.length === 0 && <p className="text-center text-slate-300 py-10 italic">No hay datos suficientes para proyectar tendencias.</p>}
                          </div>
                       </section>
                    </div>

                    <section className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm mt-10">
                        <h5 className="text-xl font-serif italic text-slate-800 mb-10 flex items-center gap-4">
                           <BookOpen className="h-6 w-6 text-emerald-500" /> Publicaciones por Revista
                        </h5>
                        <div className="h-[400px] w-full">
                           {analytics.topJournals.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={analytics.topJournals} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f8fafc" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={300} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                       cursor={{fill: '#f1f5f9'}}
                                       contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                                       itemStyle={{ color: '#10b981', fontWeight: 900 }}
                                       formatter={(value: any) => [`${value} Aprobaciones`]}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} />
                                 </BarChart>
                              </ResponsiveContainer>
                           ) : (
                              <div className="h-full flex items-center justify-center text-slate-300 italic text-sm">
                                 No hay datos de revistas asociadas a producciones aprobadas.
                              </div>
                           )}
                        </div>
                    </section>
                  </motion.div>
                )}

               {activeTab === 'DOCENTES' && (
                 <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                    <div className="rounded-[3rem] border border-slate-50 overflow-x-auto shadow-sm bg-white">
                       <table className="w-full text-left border-collapse min-w-[1200px]">
                          <thead className="bg-slate-50/50 border-b border-slate-50">
                             <tr className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                <th className="p-8">Docente / Investigador</th>
                                <th className="p-8">Contrato</th>
                                <th className="p-8 text-center bg-slate-100/30">Títulos</th>
                                <th className="p-8 text-center">Experiencia</th>
                                <th className="p-8 text-center bg-slate-100/30">Categoría</th>
                                <th className="p-8 text-center text-primary/70">Producción</th>
                                <th className="p-8 text-center bg-slate-900/[0.02] text-slate-900 border-x border-slate-50">Total Puntos</th>
                                <th className="p-8 text-right">Perfil</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {data.lecturers.map(lecturer => {
                               const lecturerSubmissions = (data.addressedSubmissions || []).filter(s => s.users?.some((u: any) => u._id === lecturer._id) && s.status === 'APROBADO');
                               
                               const salary = lecturer.profile?.initialSalaryProfile || lecturer.profile || {};
                               
                               // Special Cumulative calculation for Titles based on hierarchical Decree rules
                               const totalTitles = calculateCumulativeTitlePoints([
                                 ...lecturerSubmissions.filter(s => s.type === 'TITULO'),
                                 // include initial ones if they exist (we assume initial ones also follow rules)
                                 { type: 'TITULO', points: salary.pointsTitles || 0, subtype: 'Carga Inicial' }
                               ]);

                               const extraExperience = lecturerSubmissions.filter(s => s.type === 'EXPERIENCIA').reduce((acc, s) => acc + (s.points || 0), 0);
                               const extraCategory = lecturerSubmissions.filter(s => s.type === 'CATEGORIA').reduce((acc, s) => acc + (s.points || 0), 0);
                               const extraProduction = lecturerSubmissions.filter(s => s.type === 'PRODUCCION').reduce((acc, s) => acc + (s.points || 0), 0);

                               const totalExperience = (salary.pointsExperience || 0) + extraExperience;
                               const totalCategory = (salary.pointsCategory || 0) + extraCategory;
                               const totalProduction = (salary.pointsProduction || 0) + extraProduction;

                               const total = totalTitles + totalExperience + totalCategory + totalProduction;
                               
                               return (
                                 <tr key={lecturer._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-8">
                                       <div className="flex items-center gap-4">
                                          <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-serif text-xl border border-indigo-100/50 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                              {lecturer.fullName.charAt(0)}
                                          </div>
                                          <div>
                                             <h5 className="text-sm font-black text-slate-800">{lecturer.fullName}</h5>
                                             <p className="text-[10px] font-medium text-slate-400 italic">ID: {lecturer.identification}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="p-8">
                                       <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-amber-100">
                                          {lecturer.profile?.contractType || 'CARRERA'}
                                       </span>
                                    </td>
                                    <td className="p-8 text-center text-xs font-serif italic text-slate-500 bg-slate-100/30">{totalTitles}</td>
                                    <td className="p-8 text-center text-xs font-serif italic text-slate-500">{totalExperience}</td>
                                    <td className="p-8 text-center text-xs font-serif italic text-slate-500 bg-slate-100/30">{totalCategory}</td>
                                    <td className="p-8 text-center text-xs font-serif italic text-primary/70 font-bold">{totalProduction}</td>
                                    <td className="p-8 text-center bg-slate-900/[0.02] border-x border-slate-50">
                                       <div className="text-xl font-serif italic font-black text-slate-900">{total}</div>
                                       <div className="text-[7px] text-slate-400 uppercase font-black tracking-tighter">Puntos Salariales</div>
                                    </td>
                                    <td className="p-8 text-right">
                                       <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100"><Eye className="h-4 w-4 text-slate-400" /></Button>
                                    </td>
                                 </tr>
                               );
                             })}
                          </tbody>
                       </table>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>

      {/* MODALS SECTION */}
      
      {/* 1. Acta Creation Modal */}
      {showActaModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowActaModal(false)} />
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-xl rounded-[3rem] shadow-3xl overflow-hidden relative z-10 p-10 space-y-8">
              <h3 className="text-3xl font-serif text-slate-800 italic border-b border-slate-50 pb-6">Iniciar Nueva Sesión</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Número de Acta Oficial</label>
                    <input 
                      type="text" 
                      placeholder="Ej: CIARP-2025-001" 
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-primary/20 transition-all shadow-inner"
                      value={newActa.number}
                      onChange={e => setNewActa({...newActa, number: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Fecha de Realización</label>
                    <input 
                      type="date" 
                      className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-primary/20 transition-all shadow-inner"
                      value={newActa.date}
                      onChange={e => setNewActa({...newActa, date: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Agenda del Día</label>
                    <textarea 
                      placeholder="Detalle los puntos clave de la sesión..." 
                      className="w-full h-32 p-6 rounded-[2rem] bg-slate-50 border-none text-[11px] font-medium text-slate-600 outline-none focus:ring-2 ring-primary/20 transition-all shadow-inner resize-none"
                      value={newActa.agenda}
                      onChange={e => setNewActa({...newActa, agenda: e.target.value})}
                    />
                 </div>
              </div>
              <div className="flex items-center gap-4 pt-4">
                 <Button onClick={() => setShowActaModal(false)} variant="ghost" className="h-14 grow rounded-2xl uppercase tracking-widest text-[9px] font-bold text-slate-400">Descartar</Button>
                 <Button onClick={onCreateActa} className="h-14 grow rounded-2xl bg-slate-900 text-white uppercase tracking-widest text-[9px] font-bold shadow-xl shadow-slate-200">Guardar e Iniciar Comité</Button>
              </div>
           </motion.div>
        </div>
      )}

      {/* 2. Evaluation Modal */}
      {showEvaluationModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowEvaluationModal(null)} />
           <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-3xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 bg-slate-50/50">
                 <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Comité de Evaluación CIARP</p>
                 <h3 className="text-3xl font-serif text-slate-800 italic">
                    {showEvaluationModal === 'BULK' ? `Decisión Masiva (${selectedSubmissions.length} ítems)` : `Evaluar Mérito Docente`}
                 </h3>
                 {showEvaluationModal !== 'BULK' && <p className="text-[10px] text-slate-400 mt-2 font-medium tracking-widest uppercase truncate">{showEvaluationModal.title}</p>}
              </div>

              <div className="p-10 grow overflow-y-auto space-y-10">
                 <section className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultado de la Evaluación Oficial</label>
                    <div className="grid grid-cols-3 gap-4">
                       {[
                         { id: 'APROBADO', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100 shadow-emerald-100/50' },
                         { id: 'APLAZADO', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100 shadow-amber-100/50' },
                         { id: 'RECHAZADO', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100 shadow-red-100/50' }
                       ].map(btn => (
                         <button 
                           key={btn.id}
                           onClick={() => setEvaluation({...evaluation, status: btn.id})}
                           className={cn(
                             "flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300",
                             evaluation.status === btn.id ? cn(btn.bg, btn.border, "shadow-lg scale-105") : "border-slate-50 bg-slate-50/20 hover:border-slate-200"
                           )}
                         >
                            <btn.icon className={cn("h-8 w-8", btn.color)} />
                            <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", evaluation.status === btn.id ? btn.color : "text-slate-400")}>{btn.id}</span>
                         </button>
                       ))}
                    </div>
                 </section>

                 <section className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vincular a Acta de Sesión (Requerido)</label>
                    <select 
                      value={evaluation.actaId}
                      onChange={e => setEvaluation({...evaluation, actaId: e.target.value})}
                      className="w-full h-14 px-8 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-primary/20 transition-all shadow-inner"
                    >
                       <option value="">Seleccionar Sesión de Comité...</option>
                       {data.actas.filter(a => a.status === 'OPEN').map(a => (
                         <option key={a._id} value={a._id}>Acta Nº {a.number} - {new Date(a.date).toLocaleDateString()}</option>
                       ))}
                    </select>
                    {data.actas.filter(a => a.status === 'OPEN').length === 0 && (
                       <p className="text-[9px] text-red-500 font-bold italic">* Debe crear o abrir un Acta antes de proceder con evaluaciones.</p>
                    )}
                 </section>

                 {(evaluation.status === 'RECHAZADO' || evaluation.status === 'APLAZADO') && (
                    <section className="space-y-4 animate-in slide-in-from-top-10">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observaciones y Motivos de la Decisión</label>
                       <textarea 
                        placeholder="Describa el motivo técnico o legal de la decisión tras revisión par/comité..." 
                        className="w-full h-32 p-6 rounded-[2rem] bg-slate-50 border-none text-[11px] font-medium text-slate-600 outline-none focus:ring-2 ring-primary/20 transition-all shadow-inner resize-none"
                        value={evaluation.reason}
                        onChange={e => setEvaluation({...evaluation, reason: e.target.value})}
                       />
                    </section>
                  )}

                  {showEvaluationModal !== 'BULK' && showEvaluationModal.validatedCategory && (
                     <section className="space-y-4 animate-in slide-in-from-top-10">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Homologación de Revista Acoplada</label>
                        <div className="flex items-center gap-4 p-5 border border-emerald-100 bg-emerald-50/50 rounded-2xl">
                           <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                              {showEvaluationModal.validatedCategory}
                           </div>
                           <div>
                              <p className="text-[11px] font-bold text-emerald-800">Categoría Oficial Externa Validada</p>
                              <p className="text-[9px] text-emerald-600/70 font-black uppercase tracking-widest">Homologación CIARP Vigente (Sesión Actual)</p>
                           </div>
                           <CheckCircle2 className="h-6 w-6 text-emerald-200 ml-auto" />
                        </div>
                     </section>
                  )}

                  {showEvaluationModal !== 'BULK' && evaluation.status === 'APROBADO' && (
                    <section className="space-y-4 animate-in slide-in-from-top-10">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajuste de Puntos de Mérito (Opcional)</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
                             <Calculator className="h-5 w-5" />
                          </div>
                          <div className="grow">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Puntos Sugeridos / Aprobados</p>
                             <input 
                              type="number" 
                              className="bg-transparent border-none text-2xl font-serif italic text-slate-800 outline-none w-full"
                              value={evaluation.points}
                              onChange={e => setEvaluation({...evaluation, points: Number(e.target.value)})}
                             />
                          </div>
                       </div>
                       <p className="text-[9px] text-slate-400 italic px-4">* Puede ajustar el valor sugerido por el sistema si el comité considera una valoración diferente según el Decreto 1279.</p>
                    </section>
                  )}
               </div>

              <div className="p-10 border-t border-slate-50 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
                 <Button variant="ghost" onClick={() => setShowEvaluationModal(null)} className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Cancelar</Button>
                 <Button 
                   onClick={onEvaluate}
                   disabled={!evaluation.actaId}
                   className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200"
                 >
                    Confirmar Decisión
                 </Button>
               </div>
            </motion.div>
         </div>
      )}

      {/* 3. Acta Detail/Edit Modal */}
      {editingActa && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingActa(null)} />
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-5xl rounded-[3rem] shadow-3xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
              
              <div className="p-10 pb-6 border-b border-slate-50 shrink-0">
                 <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-serif text-slate-800 italic">Detalles de Sesión</h3>
                    <span className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border", editingActa.status === 'OPEN' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200")}>
                       {editingActa.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                    </span>
                 </div>
              </div>
              
              <div className="p-10 grow overflow-y-auto space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Número de Acta</label>
                       <input 
                         type="text" 
                         className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-primary/20 transition-all shadow-inner"
                         value={editingActa.number}
                         onChange={e => setEditingActa({...editingActa, number: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Fecha</label>
                       <input 
                         type="date" 
                         className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-primary/20 transition-all shadow-inner"
                         value={editingActa.date ? new Date(editingActa.date).toISOString().split('T')[0] : ''}
                         onChange={e => setEditingActa({...editingActa, date: e.target.value})}
                       />
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Agenda y Observaciones generales</label>
                    <textarea 
                      className="w-full h-24 p-6 rounded-[2rem] bg-slate-50 border-none text-[11px] font-medium text-slate-600 outline-none focus:ring-2 ring-primary/20 transition-all shadow-inner resize-none"
                      value={editingActa.agenda}
                      onChange={e => setEditingActa({...editingActa, agenda: e.target.value})}
                    />
                 </div>

                 {editingActa.status === 'OPEN' && (
                    <div className="pt-6 border-t border-slate-50">
                       <div className="flex items-center justify-between mb-4">
                          <div>
                             <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><BookOpen className="h-3 w-3 text-indigo-500" /> Pre-Requisito: Homologación de Revistas</h4>
                             <p className="text-[9px] text-slate-400 mt-1 italic">Valide la categoría y adjunte evidencia de las revistas del acta.</p>
                          </div>
                          <Button onClick={loadPendingJournals} variant="outline" className="h-8 px-6 rounded-xl text-[9px] font-bold uppercase tracking-widest text-indigo-600 border-indigo-100 hover:bg-indigo-50">Listar Revistas</Button>
                       </div>
                       
                       {pendingJournals && (
                          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-50/30">
                             <div className="overflow-x-auto max-h-[30vh] overflow-y-auto w-full">
                                <table className="w-full min-w-[900px] text-left border-collapse">
                                   <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-100 z-10">
                                      <tr className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                                         <th className="p-4 w-64">Revista / ISSN</th>
                                         <th className="p-4 w-64">Evidencia Indexación</th>
                                         <th className="p-4 text-center">Homologar Categoría (Salarial)</th>
                                      </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100">
                                      {pendingJournals.map(j => {
                                         const hasUpload = !!journalEvidence[j._id];
                                         const isUploading = !!journalUploading[j._id];
                                         return (
                                            <tr key={j._id} className="hover:bg-white transition-colors group">
                                               <td className="p-4">
                                                  <p className="text-[10px] font-bold text-slate-800 line-clamp-1 max-w-[250px]" title={j.name}>{j.name}</p>
                                                  <p className="text-[9px] font-mono text-slate-400 mt-1">{j.issn1}</p>
                                               </td>
                                               <td className="p-4">
                                                  <label className={cn(
                                                    "cursor-pointer flex items-center justify-center gap-2 h-9 px-4 rounded-xl border-2 border-dashed transition-all w-max",
                                                    hasUpload ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500"
                                                  )}>
                                                    <input 
                                                      type="file" 
                                                      accept="image/*,.pdf" 
                                                      className="hidden" 
                                                      onChange={(e) => e.target.files?.[0] && handleJournalFileUpload(j._id, e.target.files[0])}
                                                    />
                                                    {isUploading ? (
                                                       <span className="text-[9px] font-bold uppercase tracking-widest">Cargando...</span>
                                                    ) : hasUpload ? (
                                                       <><CheckCircle2 className="h-3 w-3" /><span className="text-[9px] font-bold uppercase tracking-widest">Soporte Adjunto</span></>
                                                    ) : (
                                                       <><Upload className="h-3 w-3" /><span className="text-[9px] font-bold uppercase tracking-widest">Subir Imagen</span></>
                                                    )}
                                                  </label>
                                               </td>
                                               <td className="p-4">
                                                  <div className={cn(
                                                    "flex items-center justify-center gap-1.5 opacity-50 pointer-events-none transition-all",
                                                    hasUpload && "opacity-100 pointer-events-auto"
                                                  )}>
                                                     {['A1', 'A2', 'B', 'C', 'NO_INDEXADA'].map(cat => (
                                                        <button 
                                                          key={cat}
                                                          onClick={() => handleValidateJournal(j._id, cat)}
                                                          className={cn(
                                                              "h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all",
                                                              j.category === cat ? "bg-emerald-500 text-white border-emerald-600 shadow-md scale-105" : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                                                          )}
                                                        >
                                                           {cat}
                                                        </button>
                                                     ))}
                                                  </div>
                                               </td>
                                            </tr>
                                         )
                                      })}
                                   </tbody>
                                </table>
                                {pendingJournals.length === 0 && <p className="text-[10px] text-slate-400 italic text-center py-8">No hay revistas pendientes de validación para puntos salariales.</p>}
                             </div>
                          </div>
                       )}
                    </div>
                 )}
              </div>
              
              <div className="p-10 border-t border-slate-50 shrink-0 bg-slate-50/50 flex flex-col gap-3">
                 <div className="flex items-center gap-3">
                    <Button onClick={() => setEditingActa(null)} variant="ghost" className="h-14 grow rounded-2xl uppercase tracking-widest text-[9px] font-bold text-slate-400">Cancelar</Button>
                    <Button onClick={onUpdateActa} className="h-14 grow rounded-2xl bg-slate-900 text-white uppercase tracking-widest text-[9px] font-bold shadow-xl shadow-slate-200">Guardar Cambios</Button>
                 </div>
                 <Button 
                   onClick={onToggleActaStatus}
                   variant="outline" 
                   className={cn("h-14 w-full rounded-2xl uppercase tracking-widest text-[9px] font-bold border-2 transition-all", editingActa.status === 'OPEN' ? "border-red-100 text-red-500 hover:bg-red-50" : "border-emerald-100 text-emerald-500 hover:bg-emerald-50")}
                 >
                    {editingActa.status === 'OPEN' ? 'Finalizar y Cerrar Sesión' : 'Reabrir Sesión'}
                 </Button>
              </div>
           </motion.div>
        </div>
      )}
      {/* 4. Handled Submission Detail Modal (Eye) */}
      {showHandledDetails && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowHandledDetails(null)} />
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-3xl rounded-[3rem] shadow-3xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 bg-slate-50/50">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Respuesta CIARP Finalizada</p>
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      showHandledDetails.status === 'APROBADO' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      showHandledDetails.status === 'APLAZADO' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-red-50 text-red-600 border-red-100"
                    )}>
                      {showHandledDetails.status}
                    </span>
                 </div>
                 <h3 className="text-2xl font-serif text-slate-800 italic">{showHandledDetails.title}</h3>
                 <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-widest uppercase">DOCENTE: {showHandledDetails.users?.[0]?.fullName}</p>
              </div>

              <div className="p-10 grow overflow-y-auto space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" /> Puntos Proyectados
                       </p>
                       <div className="text-4xl font-serif italic text-slate-400">{showHandledDetails.requestedPoints || '0'}<span className="text-[10px] font-sans not-italic ml-2 tracking-widest">PTS</span></div>
                    </div>
                    <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100">
                       <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Puntos Aprobados
                       </p>
                       <div className="text-4xl font-serif italic text-emerald-600 font-bold">{showHandledDetails.points || '0'}<span className="text-[10px] font-sans not-italic ml-2 tracking-widest">PTS</span></div>
                    </div>
                 </div>

                 {showHandledDetails.evaluationReason && (
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Justificación del Comité</label>
                      <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic leading-relaxed">
                         "{showHandledDetails.evaluationReason}"
                      </div>
                   </div>
                 )}

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Soporte y Acta de Vinculación</label>
                    <div className="flex items-center gap-3 p-6 rounded-2xl bg-white border border-slate-100">
                       <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <FileText className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-slate-800">Oficio de Respuesta — Acta {showHandledDetails.actaId?.number || 'S/N'}</p>
                          <p className="text-[9px] text-slate-400">Fecha de evaluación: {new Date(showHandledDetails.updatedAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-slate-50 bg-slate-50 flex items-center justify-end">
                 <Button onClick={() => setShowHandledDetails(null)} className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200">
                    Cerrar Detalle
                 </Button>
              </div>
           </motion.div>
        </div>
      )}
       </div>
    </div>
  )
}
