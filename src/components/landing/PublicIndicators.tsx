'use client'

import React from 'react';
import { 
  Users, 
  FileText, 
  Briefcase, 
  BookOpen, 
  ChevronRight,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { motion } from 'framer-motion';

interface PublicIndicatorsProps {
  stats: {
    counters: {
      researchers: number;
      projects: number;
      products: number;
      groups: number;
    };
    groupsByCategory: Record<string, number>;
    topSubtypes: Array<{ name: string, value: number }>;
    researchersByFaculty?: Array<{ name: string, value: number }>;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1'];

export default function PublicIndicators({ stats }: PublicIndicatorsProps) {
  const pieData = Object.entries(stats.groupsByCategory).map(([name, value]) => ({
    name: name === 'NC' ? 'No Categorizado' : `Categoría ${name}`,
    value
  })).sort((a, b) => b.value - a.value);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="w-full space-y-16">
      {/* Counters Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        <CounterCard 
          icon={Users} 
          label="Investigadores" 
          value={stats.counters.researchers} 
          color="bg-emerald-50 text-emerald-600"
          delay={0}
        />
        <CounterCard 
          icon={Briefcase} 
          label="Proyectos" 
          value={stats.counters.projects} 
          color="bg-blue-50 text-blue-600"
          delay={1}
        />
        <CounterCard 
          icon={FileText} 
          label="Productos" 
          value={stats.counters.products} 
          color="bg-amber-50 text-amber-600"
          delay={2}
        />
        <CounterCard 
          icon={BookOpen} 
          label="Grupos" 
          value={stats.counters.groups} 
          color="bg-indigo-50 text-indigo-600"
          delay={3}
        />
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Researchers by Faculty Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="text-xl font-serif text-slate-800">Docentes por Facultad</h4>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.researchersByFaculty} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[0, 8, 8, 0]} 
                  barSize={15}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Products Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h4 className="text-xl font-serif text-slate-800">Impacto en Producción</h4>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topSubtypes} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#10b981" 
                  radius={[0, 8, 8, 0]} 
                  barSize={15}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Groups by Category Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="text-xl font-serif text-slate-800">Grupos Categoría</h4>
          </div>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 justify-center">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] text-slate-500 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


function CounterCard({ icon: Icon, label, value, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className="group p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
    >
      <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center mb-6 ring-4 ring-transparent group-hover:ring-current/10 transition-all`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-3xl font-serif text-slate-800">{value.toLocaleString()}</h4>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      </div>
    </motion.div>
  );
}
