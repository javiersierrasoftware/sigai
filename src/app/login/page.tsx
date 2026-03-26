'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loginAction } from '@/lib/actions/auth-actions'
import LandingHeader from '@/components/layout/LandingHeader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await loginAction(formData)
    
    if (result.success) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(result.error || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30">
      <LandingHeader />
      <div className="flex-1 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">
          {/* Logo/Icon Container */}
          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary group transition-all duration-300">
              <LogIn className="h-8 w-8 transition-transform group-hover:scale-110" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-slate-800">Bienvenido a SIGAI</h1>
            <p className="text-slate-400 mt-2 text-[10px] uppercase tracking-[0.1em] font-medium leading-relaxed">
              Sistema Integral de Gestión Académica e Investigativa
            </p>
          </div>

          {/* Login Form */}
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
                Contraseña
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-slate-600 font-medium placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer h-5 w-5 appearance-none rounded-md border border-slate-200 bg-white checked:bg-primary checked:border-primary transition-all cursor-pointer" />
                  <div className="absolute opacity-0 peer-checked:opacity-100 pointer-events-none text-white left-1 mt-0.5">
                    <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Recordarme</span>
              </label>
              <button type="button" className="text-xs font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors">
                ¿Olvidó su contraseña?
              </button>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-7 bg-primary hover:bg-primary/95 text-white/90 rounded-[1.25rem] text-[13px] font-serif tracking-wide shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
            >
              {loading ? "Iniciando Sesión..." : "Ingresar al Portal"}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-300 text-[11px] mb-4 font-medium italic">¿Aún no tiene cuenta activa?</p>
            <Link href="/register">
              <span className="inline-flex items-center gap-3 text-primary font-serif text-lg hover:gap-4 transition-all cursor-pointer group">
                <span className="border-b border-primary/20 group-hover:border-primary group-hover:text-primary transition-all">Crear nueva cuenta de docente</span>
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}
