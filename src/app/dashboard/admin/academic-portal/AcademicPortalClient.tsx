'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  BookOpen, 
  Microscope, 
  Globe, 
  Settings,
  Save,
  GraduationCap,
  Edit2,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { createAcademicActivity, deleteAcademicActivity, updateAcademicActivity } from "@/lib/actions/academic-activity-actions"

interface Props {
  initialActivities: any[]
  user: any
}

const CATEGORIES = {
  DOCENCIA: { label: 'Docencia', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
  INVESTIGACIÓN: { label: 'Investigación', icon: Microscope, color: 'bg-sky-50 text-sky-600' },
  EXTENSIÓN: { label: 'Extensión', icon: Globe, color: 'bg-amber-50 text-amber-600' },
  INSTITUCIONAL: { label: 'Institucional', icon: Settings, color: 'bg-purple-50 text-purple-600' }
}

export default function AcademicPortalClient({ initialActivities, user }: Props) {
  const [activities, setActivities] = useState(initialActivities)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [newActivity, setNewActivity] = useState({
    name: '',
    weeklyHours: 0,
    type: 'INVESTIGACIÓN' as any
  })

  const handleAdd = async () => {
    if (!newActivity.name || newActivity.weeklyHours <= 0) return;
    setLoading(true)
    
    if (editingId) {
      const res = await updateAcademicActivity(editingId, newActivity)
      if (res.success) {
        setActivities(activities.map(a => a._id === editingId ? res.data : a))
        handleCancelEdit()
      } else {
        alert("Error: " + res.error)
      }
    } else {
      const res = await createAcademicActivity(newActivity)
      if (res.success) {
        setActivities([...activities, res.data])
        setNewActivity({ name: '', weeklyHours: 0, type: 'INVESTIGACIÓN' })
      } else {
        alert("Error: " + res.error)
      }
    }
    setLoading(false)
  }

  const handleEdit = (activity: any) => {
    setEditingId(activity._id)
    setNewActivity({
      name: activity.name,
      weeklyHours: activity.weeklyHours,
      type: activity.type
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setNewActivity({ name: '', weeklyHours: 0, type: 'INVESTIGACIÓN' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Desea eliminar esta actividad del catálogo?")) return;
    const res = await deleteAcademicActivity(id)
    if (res.success) {
      setActivities(activities.filter(a => a._id !== id))
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24 font-outfit">
      <div className="bg-white border-b border-slate-100 px-8 py-10 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary transition-all">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-serif text-slate-800 tracking-tight">Portal Academia UniSucre</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configuración centralizada de labores y asginaciones</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Lado Izquierdo: Formulario */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm sticky top-40">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-slate-800">
                  {editingId ? 'Editar Configuración' : 'Nueva Configuración'}
                </h2>
                {editingId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCancelEdit}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500"
                  >
                    Cancelar <X className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Actividad</label>
                    <div className="grid grid-cols-2 gap-3">
                       {Object.keys(CATEGORIES).map((key) => {
                          const cat = CATEGORIES[key as keyof typeof CATEGORIES]
                          return (
                             <button
                              key={key}
                              onClick={() => setNewActivity({...newActivity, type: key as any})}
                              className={cn(
                                "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2",
                                newActivity.type === key ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-slate-50 text-slate-400"
                              )}
                             >
                                <cat.icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{cat.label}</span>
                             </button>
                          )
                       })}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Actividad</label>
                    <input 
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                      placeholder="Ej: Lider Grupo de Investigación"
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                    />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horas Semanales Sugeridas</label>
                    <input 
                      type="number"
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-outfit"
                      placeholder="0"
                      value={newActivity.weeklyHours}
                      onChange={(e) => setNewActivity({...newActivity, weeklyHours: parseInt(e.target.value) || 0})}
                    />
                 </div>

                 <div className="pt-4">
                    <Button 
                      onClick={handleAdd}
                      disabled={loading}
                      className="w-full h-16 bg-primary text-white rounded-2xl shadow-xl shadow-emerald-100 font-bold uppercase tracking-widest text-[11px]"
                    >
                      {loading ? "Procesando..." : (editingId ? "Actualizar Actividad" : "Guardar Actividad")} <Save className="ml-2 h-4 w-4" />
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        {/* Lado Derecho: Listado */}
        <div className="lg:col-span-7 space-y-8">
           {Object.keys(CATEGORIES).map((key) => {
              const cat = CATEGORIES[key as keyof typeof CATEGORIES]
              const items = activities.filter(a => a.type === key)
              
              if (items.length === 0) return null;

              return (
                 <div key={key} className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                       <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", cat.color)}>
                          <cat.icon className="h-5 w-5" />
                       </div>
                       <h3 className="text-xl font-serif text-slate-800">{cat.label}</h3>
                    </div>

                    <div className="space-y-4">
                       {items.map((item) => (
                          <div key={item._id} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-50 group hover:shadow-lg hover:shadow-slate-100 transition-all">
                             <div>
                                <h4 className="font-serif text-slate-800 text-lg leading-tight">{item.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.weeklyHours} hrs semanales</p>
                             </div>
                             <div className="flex items-center gap-2">
                               <button 
                                onClick={() => handleEdit(item)}
                                className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                               >
                                  <Edit2 className="h-4 w-4" />
                               </button>
                               <button 
                                onClick={() => handleDelete(item._id)}
                                className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                               >
                                  <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )
           })}

           {activities.length === 0 && (
              <div className="bg-white rounded-[3rem] p-24 text-center flex flex-col items-center gap-4 border border-slate-50 shadow-sm">
                 <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <Settings className="h-8 w-8" />
                 </div>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No hay actividades configuradas</p>
              </div>
           )}
        </div>
      </div>
    </main>
  )
}
