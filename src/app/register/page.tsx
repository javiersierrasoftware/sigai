'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, AlertCircle, ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { registerAction } from '@/lib/actions/auth-actions'
import LandingHeader from '@/components/layout/LandingHeader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await registerAction(formData)
    
    if (result.success) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(result.error || 'Error al completar el registro')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <LandingHeader />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">
          {/* Logo/Icon Container */}
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary group transition-all duration-300">
              <UserPlus className="h-8 w-8 transition-transform group-hover:scale-110" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-slate-800">Registro</h1>
            <p className="text-slate-400 mt-2 text-[10px] uppercase tracking-[0.1em] font-medium leading-relaxed max-w-xs mx-auto">
              Únase al ecosistema de investigación de la Univ. de Sucre
            </p>
          </div>

          {/* Register Form */}
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400/80 ml-1">
                  Nombre Completo
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    placeholder="Juan Pérez"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-slate-600 font-medium placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400/80 ml-1">
                  Identificación (C.C)
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-[10px] group-focus-within:text-primary transition-colors tracking-tighter">CC</span>
                  <input 
                    type="text" 
                    name="identification"
                    required
                    placeholder="1000000000"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-slate-600 font-medium placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
              </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400/80 ml-1">
                Correo Institucional
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="docente@unisucre.edu.co"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-slate-600 font-medium placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400/80 ml-1">
                Contraseña de Acceso
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  name="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-slate-600 font-medium placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-emerald-50/30 border-l-[3px] border-primary/60 p-5 rounded-2xl">
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Al registrarse, usted declara que los datos suministrados son verídicos y que su perfil quedará habilitado bajo el rol de <span className="text-primary/80 font-bold italic">Docente Investigador</span>.
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-7 bg-primary hover:bg-primary/95 text-white/90 rounded-[1.25rem] text-[13px] font-serif tracking-wide shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
            >
              {loading ? "Creando Perfil..." : "Crear mi perfil en SIGAI"}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-300 text-[11px] mb-4 font-medium italic">¿Ya tiene una cuenta activa?</p>
            <Link href="/login">
              <span className="inline-flex items-center gap-3 text-primary font-serif text-lg hover:gap-4 transition-all cursor-pointer group">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="border-b border-primary/20 group-hover:border-primary group-hover:text-primary transition-all">Iniciar sesión ahora</span>
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}
