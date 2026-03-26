import { getSession } from "@/lib/actions/auth-actions";
import Link from "next/link";
import { 
  ArrowRight, 
  Menu, 
  ChevronDown, 
  Search, 
  BookOpen, 
  Users, 
  FileText, 
  Globe, 
  GraduationCap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LandingHeader from "@/components/layout/LandingHeader";

export default async function LandingPage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <LandingHeader user={user} />

      {/* Hero / Main Info Section */}
      <main className="flex-1">
        {/* Banner with Sage Dark Overlay */}
        <section className="relative h-[450px] w-full bg-slate-100 overflow-hidden">
           <div className="absolute inset-0 bg-neutral-900/40 z-10" />
           {/* Placeholder for institution image */}
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070')] bg-cover bg-center" />
           
           <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl text-white font-serif mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                Bienvenida
              </h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-[800px] font-medium animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                La Universidad de Sucre, se ha propuesto como objetivo estratégico realizar investigación de alto nivel mediante el desarrollo científico, la innovación tecnológica y la generación de conocimiento, que aporte a la transformación social, política y productiva de la región y el país; como también obtener el reconocimiento internacional en materia de investigación.
              </p>
           </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 px-4 sm:px-12 max-w-7xl mx-auto">
           <div className="flex flex-col items-center mb-16">
              <h3 className="text-4xl font-serif text-slate-800 mb-4">Grupos de Investigación</h3>
              <div className="h-1 w-20 bg-primary/20 rounded-full" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Artes y Humanidades", icon: BookOpen, count: "12 Grupos", color: "bg-sage-50" },
                { title: "Ciencias Básicas", icon: Globe, count: "8 Grupos", color: "bg-blue-50" },
                { title: "Ciencias de la Salud", icon: Users, count: "15 Grupos", color: "bg-emerald-50" },
                { title: "Ingeniería y Tecnología", icon: GraduationCap, count: "21 Grupos", color: "bg-slate-50" },
                { title: "Ciencias Agrícolas", icon: FileText, count: "10 Grupos", color: "bg-amber-50" },
                { title: "Buscador de Grupos", icon: Search, count: "Explorar todos", color: "bg-indigo-50" },
              ].map((cat, i) => (
                <div key={i} className="group p-8 rounded-[2.5rem] border border-slate-50 bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 cursor-pointer">
                   <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-6">
                      <cat.icon className="h-6 w-6" />
                   </div>
                   <h4 className="text-xl font-serif text-slate-800 mb-2 group-hover:text-primary transition-colors">{cat.title}</h4>
                   <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors">{cat.count}</p>
                   <div className="mt-8 flex justify-end">
                      <ArrowRight className="h-5 w-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                   </div>
                </div>
              ))}
           </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-slate-50 border-t border-slate-100 py-12 px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
           <p className="font-serif text-2xl text-slate-400 mb-4 tracking-tight">SIGAI</p>
           <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-300">
             © {new Date().getFullYear()} Universidad de Sucre — Gestión Académica e Investigativa
           </p>
        </div>
      </footer>
    </div>
  );
}
