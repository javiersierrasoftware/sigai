'use client'

import { cn } from "@/lib/utils";

export default function DashboardFooter() {
  return (
    <footer className="w-full py-12 px-6 border-t border-slate-100 bg-slate-50/10 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-serif text-slate-400 tracking-[0.3em] mb-3 opacity-60">SIGAI</h2>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
          © 2026 UNIVERSIDAD DE SUCRE — GESTIÓN ACADÉMICA E INVESTIGATIVA
        </p>
      </div>
    </footer>
  );
}
