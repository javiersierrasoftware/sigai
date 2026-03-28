'use client'

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  GraduationCap,
  Search,
  Bell,
  Settings,
  Plus,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  FileText,
  LogOut,
  ClipboardList,
  User as UserIcon,
  UserPlus, Mail, Lock, AlertCircle, ArrowLeft,
  Settings2,
  Building2,
  GraduationCap as GradIcon,
  Globe,
  Share2,
  ExternalLink,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth-actions";
import { fetchResearcherMetrics } from "@/lib/actions/user-actions";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardContentProps {
  user: {
    fullName: string;
    email: string;
    role: string;
  };
}

const dashboardCards = [
  {
    title: "Proyectos Activos",
    value: "142",
    change: "+12%",
    icon: BarChart3,
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    title: "Investigadores",
    value: "856",
    change: "+5%",
    icon: Users,
    color: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    title: "Productos",
    value: "0",
    change: "+28%",
    icon: BookOpen,
    color: "bg-teal-50 text-teal-700 border-teal-100",
  },
  {
    title: "Titulados",
    value: "318",
    change: "+15%",
    icon: GraduationCap,
    color: "bg-blue-50 text-blue-700 border-blue-100",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

export default function DashboardContent({ user }: DashboardContentProps) {
  const [mounted, setMounted] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metrics, setMetrics] = useState({
    scholar: { citations: "---", hIndex: "--", i10Index: "--", lastUpdate: new Date().toISOString() as any },
    orcid: { works: 0, education: 0, employments: 0 },
    ontology: [] as any[],
    productionTrend: [] as any[],
    projectsTrend: [] as any[],
    links: { scholar: '' as string | undefined, orcid: '' as string | undefined },
    totalProducts: 0,
    productsPerYear: '0',
    indexedPerYear: '0',
    profileStats: {
       mincienciasCategory: "Sin Categoría",
       age: { value: 0, label: "Edad" },
       seniority: { value: 0, label: "Antigüedad" },
       odsCount: { value: 0, label: "Impacto ODS", max: 17 },
       linesCount: { value: 0, label: "Líneas de Investigación" },
       groupsCount: { value: 0, label: "Grupos de Investigación" }
    },
    institutionalStats: null as { projects: number, researchers: number, products: number, titulos: number } | null,
    evaluationsCount: 0,
    activeProjectsCount: 0,
    recentProjects: [] as any[]
  });

  useEffect(() => {
    setMounted(true);
    
    async function loadMetrics() {
      const res = await fetchResearcherMetrics();
      if (res.success && res.data) {
         setMetrics(res.data);
      }
      setLoadingMetrics(false);
    }

    loadMetrics();
  }, []);

  const statusMap: Record<string, { label: string, color: string }> = {
    'DRAFT': { label: 'Borrador', color: 'bg-slate-50 text-slate-500 border-slate-100' },
    'SUBMITTED': { label: 'Enviado', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    'UNDER_REVIEW': { label: 'En Revisión', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    'APPROVED': { label: 'Aprobado', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    'REJECTED': { label: 'Rechazado', color: 'bg-red-50 text-red-700 border-red-100' },
    'IN_EXECUTION': { label: 'En Ejecución', color: 'bg-sky-50 text-sky-700 border-sky-100' },
    'CLOSED': { label: 'Finalizado', color: 'bg-slate-900/5 text-slate-900 border-slate-200 shadow-inner' }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8 pb-10">
        <DashboardHeader user={user} breadcrumbs={[{ label: 'Dashboard', active: true }]} />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-slate-800">
              ¡Hola, {user.fullName.split(' ')[0]}!
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl leading-relaxed text-[11px] uppercase tracking-widest font-medium">
              Gestione su producción investigativa con excelencia institucional.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-11 w-11 text-slate-500 border-slate-200 rounded-2xl">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/dashboard/profile">
              <Button variant="outline" size="icon" className="h-11 w-11 text-slate-500 border-slate-200 rounded-2xl hover:text-primary transition-colors">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/convocatorias">
              <Button className="h-11 px-6 bg-primary hover:bg-primary/95 text-white shadow-lg shadow-emerald-200/50 transition-all duration-200 font-bold uppercase tracking-widest text-[11px] rounded-2xl">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {dashboardCards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl border", card.color)}>
                  <card.icon className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-none">{card.title}</p>
                <h3 className={cn(
                  "text-2xl font-serif mt-2 text-slate-800 group-hover:text-primary transition-colors",
                  loadingMetrics ? "opacity-30 blur-sm" : "opacity-100"
                )}>
                  {metrics.institutionalStats ? (
                    idx === 0 ? metrics.institutionalStats.projects.toLocaleString() :
                    idx === 1 ? metrics.institutionalStats.researchers.toLocaleString() :
                    idx === 2 ? metrics.institutionalStats.products.toLocaleString() :
                    metrics.institutionalStats.titulos.toLocaleString()
                  ) : (
                    idx === 0 ? metrics.activeProjectsCount.toLocaleString() :
                    idx === 2 ? metrics.totalProducts.toLocaleString() : 
                    card.value
                  )}
                </h3>
              </div>

              {/* Subtle card decoration */}
              <div className="absolute -right-2 -bottom-2 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-500">
                <card.icon className="h-24 w-24" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          {/* Left Column - Recent Activity & Analytics */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <h2 className="font-serif text-slate-800 flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary/70" />
                  Proyectos Recientes
                </h2>
                <Link href={user.role === 'ADMIN' || user.role === 'ADMINDIUS' ? "/dashboard/admin/projects" : "/dashboard/projects"}>
                  <Button variant="ghost" size="sm" className="text-[11px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 hover:bg-primary/5 -mr-2">
                    Ver todos <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-slate-50">
                {metrics.recentProjects.length > 0 ? (
                  metrics.recentProjects.map((project: any) => (
                    <div key={project._id} className="px-8 py-5 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between text-left">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                             "h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300",
                             statusMap[project.status]?.color.replace('text-', 'bg-').split(' ')[0] || "bg-slate-50",
                             "bg-opacity-10 text-primary"
                          )}>
                            <BarChart3 className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-serif text-slate-800 group-hover:text-primary transition-colors leading-tight text-lg line-clamp-1">{project.title}</h4>
                            <p className="text-[10px] text-slate-300 mt-1 font-medium uppercase tracking-wider">
                              Actualizado el {new Date(project.updatedAt).toLocaleDateString()} • {project.principalInvestigator}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-xl block border shadow-sm transition-all",
                            statusMap[project.status]?.color || "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                            {statusMap[project.status]?.label || project.status}
                          </span>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 group-hover:text-slate-600 rounded-xl">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center flex flex-col items-center gap-4 bg-slate-50/30">
                     <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <BarChart3 className="h-8 w-8" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay proyectos registrados</p>
                        <p className="text-[10px] text-slate-300 mt-1 italic font-medium uppercase tracking-tighter">Inicie una nueva postulación para visualizar su actividad aquí.</p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* NEW: RESEARCH ANALYTICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              {/* Google Scholar Card */}
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col group/scholar"
              >
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-sky-50/20">
                  <h2 className="font-serif text-slate-800 flex items-center gap-2 text-xl">
                    <Globe className="h-5 w-5 text-sky-500/70" />
                    Google Scholar
                  </h2>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-slate-100">
                    Corte: {mounted ? new Date(metrics.scholar.lastUpdate).toLocaleDateString('es-CO', { month: '2-digit', year: 'numeric' }) : '--/----'}
                  </span>
                </div>
                         <div className="p-8 flex-1 flex flex-col justify-center">
                  {!metrics.scholar.citations || metrics.scholar.citations === "---" ? (
                    <div className="text-center py-6 space-y-4">
                       <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                          <Globe className="h-8 w-8" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enlace no detectado</p>
                          <p className="text-[10px] text-slate-300 mt-1 uppercase">Configure su URL de Scholar en el perfil</p>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {[
                        { label: "Citas", value: metrics.scholar.citations, color: "text-sky-600", bg: "bg-sky-50" },
                        { label: "Índice h", value: metrics.scholar.hIndex, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Índice i10", value: metrics.scholar.i10Index, color: "text-purple-600", bg: "bg-purple-50" }
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between group/metric">
                          <div className="flex items-center gap-4">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs transition-transform group-hover/metric:scale-110", m.bg, m.color)}>
                              {m.label[0]}
                            </div>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">{m.label}</span>
                          </div>
                          <div className={cn(
                             "text-2xl font-serif tracking-tight transition-all",
                             loadingMetrics ? "text-slate-200 blur-sm" : "text-slate-800"
                          )}>
                             {m.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-10 pt-8 border-t border-slate-50">
                    <Link href={metrics.links.scholar || "/dashboard/profile"} target={metrics.links.scholar ? "_blank" : "_self"} className="w-full">
                      <Button variant="outline" className="w-full h-12 rounded-2xl border-sky-100 text-sky-600 font-bold uppercase tracking-widest text-[11px] hover:bg-sky-50 hover:border-sky-200 transition-all flex items-center justify-center gap-2 font-outfit">
                         <ExternalLink className="h-4 w-4" /> {metrics.scholar.citations === "---" ? "Configurar Perfil" : "Ver Perfil en Scholar"}
                      </Button>
                    </Link>
                    <p className="text-[9px] text-slate-300 mt-4 text-center leading-relaxed font-medium uppercase tracking-tighter italic">
                      Sincronizado via SIGAI Advanced Scraper Engine
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Ontological Diagram Card */}
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col group/onto"
              >
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-emerald-50/20">
                  <h2 className="font-serif text-slate-800 flex items-center gap-2 text-xl">
                    <Share2 className="h-5 w-5 text-primary/70" />
                    Mapa Ontológico
                  </h2>
                  <Activity className={cn("h-4 w-4 text-emerald-400", loadingMetrics ? "animate-spin" : "animate-pulse")} />
                </div>

                <div className="p-4 flex-1 relative flex items-center justify-center min-h-[300px] overflow-hidden">
                  {/* Custom SVG Network Visualization */}
                  <svg viewBox="0 0 200 200" className={cn("w-full h-full max-h-[320px] drop-shadow-2xl overflow-visible transition-opacity", loadingMetrics ? "opacity-20" : "opacity-100")}>
                    <defs>
                      <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </radialGradient>
                    </defs>
                    
                    {/* Connections */}
                    {Array.from({ length: Math.max(8, metrics.orcid.works > 0 ? Math.min(15, metrics.orcid.works) : 8) }).map((_, i, arr) => {
                       const angle = (i / arr.length) * Math.PI * 2;
                       const r = 75;
                       const x = 100 + Math.cos(angle) * r;
                       const y = 100 + Math.sin(angle) * r;
                       return (
                         <motion.line 
                           key={`line-${i}`}
                           x1="100" y1="100" x2={x} y2={y} 
                           stroke="#f1f5f9" 
                           strokeWidth="0.8" 
                           initial={{ pathLength: 0, opacity: 0 }}
                           animate={{ pathLength: 1, opacity: 1 }}
                           transition={{ duration: 2, delay: i * 0.1 }}
                         />
                       )
                    })}
                    
                    {/* Outer Nodes */}
                    {Array.from({ length: Math.max(8, metrics.orcid.works > 0 ? Math.min(15, metrics.orcid.works) : 8) }).map((_, i, arr) => {
                       const angle = (i / arr.length) * Math.PI * 2;
                       const r = 75;
                       const x = 100 + Math.cos(angle) * r;
                       const y = 100 + Math.sin(angle) * r;
                       return (
                         <motion.circle 
                           key={`node-${i}`}
                           cx={x} cy={y} r="6" 
                           fill={i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#3b82f6" : "#f59e0b"} 
                           className="cursor-pointer"
                           initial={{ scale: 0 }}
                           animate={{ scale: [1, 1.1, 1], y: [0, -2, 0] }}
                           transition={{ duration: 4, repeat: Infinity, delay: i * 0.2 }}
                         />
                       )
                    })}
                    
                    {/* Central Node */}
                    <motion.circle 
                      cx="100" cy="100" r="16" 
                      fill="url(#nodeGradient)"
                      className="cursor-pointer"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.8 }}
                    />
                  </svg>

                  {/* Legend Overlay */}
                  <div className="absolute bottom-6 left-8 space-y-2 pointer-events-none bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-100 shadow-sm">
                    {[
                      { l: "Año", c: "bg-slate-400" },
                      { l: "Institución", c: "bg-blue-400" },
                      { l: "Investigador", c: "bg-amber-500" },
                      { l: "Publicación", c: "bg-purple-500" },
                      { l: "Revista", c: "bg-emerald-500" }
                    ].map((l, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-sm", l.c)} />
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{l.l}</span>
                      </div>
                    ))}
                  </div>

                  {loadingMetrics && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                       <div className="flex flex-col items-center gap-3">
                          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Sincronizando ORCID...</span>
                       </div>
                    </div>
                  )}
                </div>

                <div className="px-8 pb-8">
                  <Link href={metrics.links.orcid || "/dashboard/profile"} target={metrics.links.orcid ? "_blank" : "_self"} className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-2xl border-emerald-100 text-emerald-600 font-bold uppercase tracking-widest text-[11px] hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center justify-center gap-2 font-outfit">
                      <ExternalLink className="h-4 w-4" /> {metrics.orcid.works === 0 && !metrics.links.orcid ? "Configurar Perfil" : "Ampliar diagrama ontológico"}
                    </Button>
                  </Link>
                  <p className="text-[9px] text-slate-300 mt-4 text-center leading-relaxed font-medium uppercase tracking-tighter">
                    Fuente: ORCID. (2026). Identificadores de investigadores.<br />
                    Recuperado el {mounted ? new Date().toLocaleDateString() : '--/--/----'} de orcid.org/profile.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* NEW: PRODUCTION TRENDS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 pb-12">
               {/* Production by Type Chart */}
               <motion.div 
                 variants={itemVariants}
                 className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col"
               >
                 <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                    <h2 className="font-serif text-slate-800 flex items-center gap-2 text-xl">
                      <BarChart3 className="h-5 w-5 text-emerald-500/70" />
                      Producción Académica
                    </h2>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded-lg bg-white">Últimos 5 años</span>
                 </div>
                 <div className="p-8 h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ReBarChart data={metrics.productionTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="year" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            align="right" 
                            iconType="circle" 
                            wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '20px' }}
                          />
                          <Bar dataKey="articles" name="Artículos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} stackId="a" />
                          <Bar dataKey="chapters" name="Capítulos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} stackId="a" />
                          <Bar dataKey="others" name="Otros" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} stackId="a" />
                       </ReBarChart>
                    </ResponsiveContainer>
                 </div>
               </motion.div>

               {/* Projects Trend Chart */}
               <motion.div 
                 variants={itemVariants}
                 className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col"
               >
                 <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                    <h2 className="font-serif text-slate-800 flex items-center gap-2 text-xl">
                      <ClipboardList className="h-5 w-5 text-sky-500/70" />
                      Proyectos Ejecutados
                    </h2>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded-lg bg-white">Crecimiento Anual</span>
                 </div>
                 <div className="p-8 h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ReBarChart data={metrics.projectsTrend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="year" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                          />
                          <Bar dataKey="total" name="Proyectos" fill="#6366f1" radius={[8, 8, 4, 4]} barSize={32}>
                             <motion.div />
                          </Bar>
                       </ReBarChart>
                    </ResponsiveContainer>
                 </div>
               </motion.div>
            </div>
          </div>

          {/* Right Column - Sidebar style */}
          <div className="space-y-6">
            <div className="bg-primary rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold font-outfit mb-2 text-accent">Acceso Rápido</h3>
                <p className="text-emerald-50 text-sm mb-8 leading-relaxed opacity-90">Inicie nuevas solicitudes o acceda a su base de conocimientos.</p>

                <div className="space-y-3">
                  <Link href="/dashboard/academic-history">
                    <button className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl p-4 text-xs font-bold uppercase tracking-widest">
                      <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <GradIcon className="h-4 w-4" />
                      </div>
                      Historia Docente
                    </button>
                  </Link>

                  <Link href="/dashboard/evaluations">
                    <button className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl p-4 text-xs font-bold uppercase tracking-widest relative group/item">
                      <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center group-hover/item:bg-emerald-500 transition-colors">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      Evaluar Proyectos
                      {(metrics.evaluationsCount || 0) > 0 && (
                        <span className="absolute right-4 bg-rose-500 text-[8px] px-2.5 py-1 rounded-lg shadow-lg border border-white/20 animate-pulse font-black">
                          {metrics.evaluationsCount} PENDIENTES
                        </span>
                      )}
                    </button>
                  </Link>

                  <Link href={user.role === 'ADMIN' || user.role === 'ADMINDIUS' ? "/dashboard/admin/projects" : "/dashboard/projects"}>
                    <button className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl p-4 text-xs font-bold uppercase tracking-widest">
                      <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      Proyectos
                    </button>
                  </Link>

                  <Link href="/dashboard/convocatorias">
                    <button className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl p-4 text-xs font-bold uppercase tracking-widest">
                      <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <Plus className="h-4 w-4" />
                      </div>
                      Nueva Postulación
                    </button>
                  </Link>

                  <Link href="/dashboard/explorador">
                    <button className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl p-4 text-xs font-bold uppercase tracking-widest text-left">
                      <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <Search className="h-4 w-4" />
                      </div>
                      Explorador SIGAI
                    </button>
                  </Link>
                </div>
              </div>
              {/* Background art */}
              <div className="absolute -right-12 -top-12 h-48 w-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
            </div>

            {/* CIARP ADMIN ONLY: Committee Management */}
            {user.role === 'ADMINCIARP' && (
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-serif">Gestión CIARP</h3>
                  </div>

                  <div className="space-y-3">
                    <Link href="/dashboard/ciarp-admin">
                      <button className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest border border-white/5 group/btn">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-emerald-400" />
                          Portal Administrativo CIARP
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    </Link>
                  </div>
                </div>
                {/* Background art */}
                <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
              </div>
            )}

            {/* ADMIN ONLY: Institutional Management */}
            {(user.role === 'ADMIN' || user.role === 'ADMINDIUS') && (
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-serif">Administración</h3>
                  </div>

                  <div className="space-y-3">
                    <Link href="/dashboard/admin/faculties">
                      <button className="w-full flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest border border-white/5 group/btn">
                        <Building2 className="h-4 w-4 text-emerald-400" />
                        <span className="flex-1 text-center px-2">Gestionar Facultades y Programas</span>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    </Link>
                    <Link href="/dashboard/admin/research-groups">
                      <button className="w-full flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest border border-white/5 group/btn">
                        <Search className="h-4 w-4 text-sky-400" />
                        <span className="flex-1 text-center px-2">Gestionar Grupos de Investigación</span>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    </Link>
                    <Link href="/dashboard/admin/research-lines">
                      <button className="w-full flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest border border-white/5 group/btn">
                        <TrendingUp className="h-4 w-4 text-amber-400" />
                        <span className="flex-1 text-center px-2">Líneas de Investigación</span>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    </Link>
                    <Link href="/dashboard/admin/calls">
                      <button className="w-full flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest border border-white/5 group/btn">
                        <ClipboardList className="h-4 w-4 text-indigo-400" />
                        <span className="flex-1 text-center px-2">Gestionar Proyectos y Convocatorias</span>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    </Link>
                    <Link href="/dashboard/admin/rubrics">
                      <button className="w-full flex items-center bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-4 text-[11px] font-bold uppercase tracking-widest border border-white/5 group/btn">
                        <FileText className="h-4 w-4 text-rose-400" />
                        <span className="flex-1 text-center px-2">Rúbricas de Evaluación</span>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover/btn:translate-x-1 transition-all" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 font-outfit text-lg">Caracterización</h3>
                <div className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10 shadow-sm animate-pulse">
                  {metrics.profileStats.mincienciasCategory}
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: "Años de edad", value: metrics.profileStats.age.value, max: 90, color: "bg-emerald-500", suffix: "" },
                  { label: "Años en universidad", value: metrics.profileStats.seniority.value, max: 40, color: "bg-sky-500", suffix: "" },
                  { label: "Impacto en ODS", value: metrics.profileStats.odsCount.value, max: 17, color: "bg-amber-500", suffix: "/17" },
                  { label: "Líneas de Impacto", value: metrics.profileStats.linesCount.value, max: 10, color: "bg-purple-500", suffix: "" },
                  { label: "Grupos asociados", value: metrics.profileStats.groupsCount.value, max: 8, color: "bg-primary", suffix: "" },
                  { label: "Productos / Año (Prom)", value: parseFloat(metrics.productsPerYear), max: 5, color: "bg-rose-500", suffix: "" },
                  { label: "Artículos Indexados / Año", value: parseFloat(metrics.indexedPerYear), max: 3, color: "bg-sky-500", suffix: "" },
                ].map((metric, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                      <span className="text-slate-400">{metric.label}</span>
                      <span className="text-slate-900">{metric.value}{metric.suffix}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (metric.value / metric.max) * 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        className={cn("h-full rounded-full transition-all shadow-sm", metric.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
