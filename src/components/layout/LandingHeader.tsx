'use client'

import Link from "next/link";
import { ChevronDown, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeaderProps {
  user?: {
    fullName: string;
    role: string;
  } | null;
}

export default function LandingHeader({ user }: LandingHeaderProps) {
  return (
    <header className="bg-primary text-white border-b border-white/10 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
           <Link href="/" className="font-serif text-2xl tracking-tight">SIGAI</Link>
           <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
              <Link href="/" className="text-white hover:text-white transition-colors">Inicio</Link>
           </nav>
        </div>
        
        <div className="flex items-center gap-4">
           {user ? (
             <Link href="/dashboard">
               <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl text-[11px] font-bold uppercase tracking-widest h-10 px-6">
                  Ir al Dashboard
               </Button>
             </Link>
           ) : (
             <div className="flex items-center gap-3">
               <Link href="/login">
                 <button className="text-[11px] font-bold uppercase tracking-widest text-white/90 hover:text-white transition-colors px-4">
                   Ingresar
                 </button>
               </Link>
               <Link href="/register">
                 <Button className="bg-primary-foreground text-primary hover:bg-white/90 rounded-2xl text-[11px] font-bold uppercase tracking-widest h-10 px-6 shadow-xl shadow-black/10">
                    Registro
                 </Button>
               </Link>
             </div>
           )}
           <button className="lg:hidden text-white"><Menu className="h-6 w-6" /></button>
        </div>
      </div>
    </header>
  );
}
