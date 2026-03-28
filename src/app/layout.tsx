import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newsreader = Newsreader({ 
  subsets: ["latin"], 
  variable: "--font-newsreader",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "SIGAI | Sistema Integral de Gestión Académica e Investigativa",
  description: "Plataforma integral para el fomento, seguimiento y evaluación de la producción investigativa y académica de excelencia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-slate-50/20 font-sans antialiased text-slate-900 selection:bg-emerald-100 selection:text-emerald-900",
          inter.variable,
          newsreader.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          {/* Main Application Container with Premium Layout */}
          <main className="flex-1">
            {children}
          </main>
          <DashboardFooter />
          
          {/* Background Decorative Elements */}
          <div className="fixed inset-0 -z-10 h-full w-full bg-slate-50 [background:radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />
          <div className="fixed top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          <div className="fixed bottom-0 left-0 -z-10 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        </div>
      </body>
    </html>
  );
}
