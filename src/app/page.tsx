import { getSession } from "@/lib/actions/auth-actions";
import { getPublicStats } from "@/lib/actions/public-actions";
import LandingHeader from "@/components/layout/LandingHeader";
import PublicIndicators from "@/components/landing/PublicIndicators";
import { ArrowRight, Search, Activity, Target, Zap } from "lucide-react";

export default async function LandingPage() {
  const session = await getSession();
  const user = session?.user;

  const statsResponse = await getPublicStats();
  const defaultStats = {
    counters: { researchers: 0, projects: 0, products: 0, groups: 0 },
    groupsByCategory: {} as Record<string, number>,
    topSubtypes: [] as Array<{ name: string, value: number }>
  };

  const stats = (statsResponse.success && statsResponse.data) ? statsResponse.data : defaultStats;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <LandingHeader user={user} />

      <main className="flex-1">
        {/* Banner with Sage Dark Overlay */}
        <section className="relative h-[550px] w-full bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-neutral-900/60 z-10" />
          {/* Placeholder for institution image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070')] bg-cover bg-center" />

          <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <Activity className="h-3 w-3" />
              Impacto Académico e Investigativo
            </div>

            <h1 className="text-6xl md:text-8xl text-white font-serif mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              SIGAI
            </h1>

            <div className="h-1 w-24 bg-white/30 rounded-full mb-8" />

            <p className="text-white/90 text-sm md:text-xl leading-relaxed max-w-[900px] font-light animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
              Sistema Integral de Gestión Académica e Investigativa de la Universidad de Sucre.
              <span className="block mt-4 text-white/70 text-base md:text-lg">
                Una plataforma avanzada diseñada para la gestión institucional, visibilidad e impacto de la producción académica y científica de nuestra comunidad.
              </span>
            </p>
          </div>
        </section>

        {/* Public Indicators Section */}
        <section className="py-32 px-4 sm:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-24">
            <div className="p-3 bg-primary/5 rounded-2xl text-primary mb-6">
              <Target className="h-8 w-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-800 mb-4 text-center">Algunos Indicadores Unisucre</h2>
            <div className="h-1 w-20 bg-primary/20 rounded-full" />
            <p className="mt-6 text-slate-400 text-sm md:text-base font-medium uppercase tracking-widest">Visualización en tiempo real del impacto institucional</p>
          </div>

          <PublicIndicators stats={stats} />
        </section>

        {/* Call to Action Grid */}
        <section className="pb-32 px-4 sm:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group p-10 rounded-[3rem] bg-gradient-to-br from-primary to-emerald-700 text-white shadow-2xl shadow-primary/20 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                <Zap className="h-48 w-48" />
              </div>
              <h3 className="text-3xl font-serif mb-4 relative z-10">Buscador de Grupos</h3>
              <p className="text-white/80 mb-10 text-lg relative z-10">Consulte la información detallada de los grupos de investigación categorizados por Minciencias.</p>
              <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-[0.2em] relative z-10 cursor-pointer hover:gap-4 transition-all">
                Ir al Explorador <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            <div className="group p-10 rounded-[3rem] bg-white border border-slate-100 text-slate-800 shadow-xl shadow-slate-100 transition-all overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform text-primary">
                <Search className="h-48 w-48" />
              </div>
              <h3 className="text-3xl font-serif mb-4 relative z-10">Portal Académico</h3>
              <p className="text-slate-500 mb-10 text-lg relative z-10">Acceda a la gestión de convocatorias, planes de trabajo y seguimiento a productos de investigación.</p>
              <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-[0.2em] text-primary relative z-10 cursor-pointer hover:gap-4 transition-all">
                Iniciar Sesión <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

