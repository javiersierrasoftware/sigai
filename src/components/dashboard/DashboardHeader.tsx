'use client'

import { cn } from "@/lib/utils";
import { User as UserIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth-actions";

interface DashboardHeaderProps {
  user: {
    fullName: string;
    email: string;
    role: string;
  };
  breadcrumbs?: { label: string; href?: string; active?: boolean }[];
}

export default function DashboardHeader({ user, breadcrumbs = [] }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-6 transition-all duration-300">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Link href="/dashboard" className="hover:text-primary transition-colors">SIGAI</Link>
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-slate-200">/</span>
            {crumb.href && !crumb.active ? (
              <Link href={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</Link>
            ) : (
              <span className={cn(crumb.active ? "text-primary font-black" : "text-slate-400")}>
                {crumb.label}
              </span>
            )}
          </div>
        ))}
        {breadcrumbs.length === 0 && (
          <>
            <span className="text-slate-200">/</span>
            <span className="text-primary font-black">Dashboard</span>
          </>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard/profile" className="flex items-center gap-3 pr-6 border-r border-slate-100 group">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black text-slate-900 group-hover:text-primary transition-all leading-none">{user.fullName}</p>
            <p className="text-[9px] font-bold text-primary uppercase tracking-tighter mt-1">{user.role}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
            <UserIcon className="h-4 w-4" />
          </div>
        </Link>
        <button
          onClick={() => logoutAction()}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all group"
          title="Cerrar sesión"
        >
          <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
