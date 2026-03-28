'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Users,
  BookOpen,
  ClipboardList,
  Target,
  Search,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  Globe,
  Filter,
  Download,
  Share2,
  Calendar,
  Building2,
  FlaskConical,
  GraduationCap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from 'next/link'
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts'

interface Props {
  initialData: any
}

const ODS_LIST = [
  "1. Fin de la pobreza", "2. Hambre cero", "3. Salud y bienestar", "4. Educación de calidad",
  "5. Igualdad de género", "6. Agua limpia y saneamiento", "7. Energía asequible", "8. Trabajo decente",
  "9. Industria e innovación", "10. Reducción de desigualdades", "11. Ciudades sostenibles",
  "12. Consumo responsable", "13. Acción por el clima", "14. Vida submarina",
  "15. Vida de ecosistemas", "16. Paz y justicia", "17. Alianzas"
]

export default function InstitutionalExplorerClient({ initialData }: Props) {
  const [activeYear, setActiveYear] = useState('TODOS')
  const [activeFaculty, setActiveFaculty] = useState('TODOS')
  const [activeGroup, setActiveGroup] = useState('TODOS')
  
  const stats = initialData.stats;
  const activityTrend = initialData.activityTrend;
  const odsData = initialData.odsData;

  const STATS_CARDS = [
    { label: "Grupos de Investigación", value: stats.groups, icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Investigadores", value: stats.investigators, icon: GraduationCap, color: "text-sky-500", bg: "bg-sky-50" },
    { label: "Productos de Investigación", value: stats.products, icon: BookOpen, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Proyectos de Investigación", value: stats.projects, icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Semilleros de Investigación", value: stats.semilleros, icon: FlaskConical, color: "text-rose-500", bg: "bg-rose-50" }
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-outfit">
      
      {/* Dynamic Header Section for Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white/40 backdrop-blur-sm p-6 rounded-[2rem] border border-white/60">
        <div>
           <h1 className="text-3xl font-serif text-slate-800 tracking-tight italic">Explorador SIGAI</h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Centro de Inteligencia Investigativa e Institucional</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-11 px-6 rounded-2xl border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[9px] gap-2 hover:bg-white transition-all">
              <Download className="h-4 w-4" /> Exportar Reporte
           </Button>
           <Button className="h-11 px-8 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-slate-200 transition-all">
              <Share2 className="mr-2 h-4 w-4" /> Publicar Hallazgos
           </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
        
        {/* Global Filter Bar */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
           <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
                 <Filter className="h-4 w-4 text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Filtros Maestros</span>
              </div>
              
              <div className="flex items-center gap-4 flex-1">
                 <div className="flex-1 space-y-1.5">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Periodo Anual</p>
                    <select value={activeYear} onChange={(e) => setActiveYear(e.target.value)} className="w-full h-12 px-5 bg-slate-50 rounded-xl outline-none text-[10px] font-bold uppercase tracking-widest text-slate-600 appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                       <option value="TODOS">Todos los años</option>
                       {[2026, 2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                 </div>
                 <div className="flex-1 space-y-1.5">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Unidad Académica / Facultad</p>
                    <select value={activeFaculty} onChange={(e) => setActiveFaculty(e.target.value)} className="w-full h-12 px-5 bg-slate-50 rounded-xl outline-none text-[10px] font-bold uppercase tracking-widest text-slate-600 appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                       <option value="TODOS">Todas las Facultades</option>
                       {initialData.faculties.map((f: any) => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                 </div>
                 <div className="flex-1 space-y-1.5">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Grupo Investigativo</p>
                    <select value={activeGroup} onChange={(e) => setActiveGroup(e.target.value)} className="w-full h-12 px-5 bg-slate-50 rounded-xl outline-none text-[10px] font-bold uppercase tracking-widest text-slate-600 appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                       <option value="TODOS">Todos los Grupos</option>
                       <option value="A1">Categoría A1</option>
                       <option value="A">Categoría A</option>
                       <option value="B">Categoría B</option>
                    </select>
                 </div>
              </div>
              <Button size="icon" className="h-12 w-12 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl shadow-none border-none">
                 <Search className="h-5 w-5" />
              </Button>
           </div>
        </section>

        {/* High-Level Pulse Section */}
        <section className="space-y-8">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-4xl font-serif text-slate-800 tracking-tight italic">Actividad investigadora en cifras</h2>
              <div className="h-1 w-24 bg-emerald-500 rounded-full" />
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {STATS_CARDS.map((card, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[2.5rem] p-10 border border-slate-50 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group relative overflow-hidden text-center"
                >
                   <div className={cn("h-16 w-16 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", card.bg, card.color)}>
                      <card.icon className="h-8 w-8" />
                   </div>
                   <h3 className="text-5xl font-serif text-slate-800 mb-2 tracking-tighter">{card.value.toLocaleString()}</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                   
                   <div className="absolute top-0 right-0 h-24 w-24 bg-slate-50/50 rounded-full blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
           </div>
        </section>

        {/* Temporal Trends & ODS Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           
           {/* Growth Charts */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm">
                 <div className="flex items-center justify-between mb-12">
                    <div>
                       <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Evolución Estratégica</p>
                       <h3 className="text-3xl font-serif text-slate-800 tracking-tighter italic">Distribución actividad investigadora últimos 5 años</h3>
                    </div>
                    <div className="flex items-center gap-4">
                       {[
                         { l: "Proyectos", c: "#10b981" },
                         { l: "Grupos", c: "#3b82f6" },
                         { l: "Semilleros", c: "#22d3ee" }
                       ].map(l => (
                          <div key={l.l} className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: l.c }} />
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{l.l}</span>
                          </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <ReBarChart data={activityTrend} margin={{ top: 20 }}>
                          <defs>
                             <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.4}/>
                             </linearGradient>
                          </defs>
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
                             contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="proyectos" name="Proyectos" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} stackId="a" />
                          <Bar dataKey="grupos" name="Grupos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} stackId="a" />
                          <Bar dataKey="productos" name="Productos" fill="#22d3ee" radius={[2, 2, 0, 0]} barSize={40} stackId="a" />
                       </ReBarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Research Insights / Heatmap Simulation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Nube de Conocimiento</h4>
                    <h3 className="text-3xl font-serif mb-8 tracking-tighter leading-tight italic">Tendencias en palabras clave investigadas</h3>
                    
                    <div className="flex flex-wrap gap-3">
                       {["IA", "Salud", "Sostenibilidad", "Energía", "Educación", "Impacto", "Tecnología", "Social", "Inclusión", "Amazonía"].map(word => (
                          <span key={word} className="px-5 py-2.5 bg-white/10 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors cursor-pointer border border-white/5">
                             {word}
                          </span>
                       ))}
                    </div>
                    
                    <div className="absolute -right-20 -bottom-20 opacity-[0.05] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                       <TrendingUp className="h-96 w-96" />
                    </div>
                 </div>

                 <div className="bg-white rounded-[3rem] p-12 border border-slate-50 shadow-sm">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Productividad por Línea</h4>
                    <div className="space-y-6">
                       {initialData.lines.slice(0, 5).map((line: any, idx: number) => (
                          <div key={idx} className="space-y-2">
                             <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span>{line.name}</span>
                                <span>{Math.floor(Math.random() * 50) + 10}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.floor(Math.random() * 70) + 30}%` }}
                                  className="h-full bg-primary rounded-full"
                                />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           {/* ODS GRID - From Screenshot 2 */}
           <div className="lg:col-span-1 space-y-8">
              <div className="bg-slate-50 rounded-[2rem] p-4 flex flex-col h-full border border-slate-100">
                 <div className="px-4 py-8 text-center bg-white rounded-[1.5rem] mb-6 shadow-sm">
                    <h3 className="text-xl font-serif text-slate-800 tracking-tight leading-tight">Ver investigación alineada a los ODS</h3>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-1">
                    {ODS_LIST.map((ods, i) => {
                       const data = odsData.find((d: any) => d.id === i + 1) || { groups: 0, projects: 0 };
                       return (
                          <motion.div 
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="aspect-square bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative group cursor-pointer overflow-hidden"
                          >
                             {/* Mock ODS Color (using IDs) */}
                             <span className={cn(
                               "text-3xl font-black mb-1 opacity-20",
                               `ods-color-${i+1}`
                             )}>{i + 1}</span>
                             <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter leading-tight line-clamp-2">{(ods.split('. ')[1]).toUpperCase()}</p>
                             
                             {/* Hover Stats Panel - Matches Screenshot 2 style */}
                             <div className="absolute inset-0 bg-slate-800/90 text-white flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[7px] font-bold uppercase tracking-widest mb-2">Grupos: {data.groups}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest mb-4">Proyectos: {data.projects}</p>
                                <button className="h-7 px-4 bg-primary rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all shadow-lg shadow-black/10">Ver</button>
                             </div>
                             
                             {/* Background generic icon simulation */}
                             <Globe className="absolute -bottom-1 -right-1 h-6 w-6 text-slate-50 opacity-10" />
                          </motion.div>
                       );
                    })}
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Footer Insight */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 pt-12 border-t border-slate-100 flex items-center justify-between opacity-40">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 SIGAI — Sistema Integral de Gestión Académica e Investigativa</p>
         <div className="flex gap-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gobierno de Datos</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumplimiento Minciencias</span>
         </div>
      </footer>

      {/* Dynamic Styles for ODS Colors (approximation) */}
      <style jsx>{`
        .ods-color-1 { color: #e5243b; }
        .ods-color-2 { color: #dda63a; }
        .ods-color-3 { color: #4c9f38; }
        .ods-color-4 { color: #c5192d; }
        .ods-color-5 { color: #ff3a21; }
        .ods-color-6 { color: #26bde2; }
        .ods-color-7 { color: #fcc30b; }
        .ods-color-8 { color: #a21942; }
        .ods-color-9 { color: #fd6925; }
        .ods-color-10 { color: #dd1367; }
        .ods-color-11 { color: #fd9d24; }
        .ods-color-12 { color: #bf8b2e; }
        .ods-color-13 { color: #3f7e44; }
        .ods-color-14 { color: #0a97d9; }
        .ods-color-15 { color: #56c02b; }
        .ods-color-16 { color: #00689d; }
        .ods-color-17 { color: #19486a; }
      `}</style>
    </main>
  )
}
