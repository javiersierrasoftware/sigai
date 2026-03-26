'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, FileText, Upload, Check, AlertCircle, 
  Trash2, ShieldCheck, ChevronRight, Info,
  Calculator, FileBadge, Users, Newspaper
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { uploadFile } from "@/lib/actions/storage-actions"
import { sendToCiarp } from "@/lib/actions/academic-actions"
import { cn } from "@/lib/utils"
import { calculateIndexedArticlePoints, getArticleBasePoints } from "@/lib/utils/decreto-1279"

interface Props {
  isOpen: boolean
  onClose: () => void
  item: any
}

export default function CiarpSubmissionModal({ isOpen, onClose, item }: Props) {
  const [loading, setLoading] = useState(false)
  const [recognitionType, setRecognitionType] = useState('SALARIAL')
  const [evidence, setEvidence] = useState<Record<string, string>>({})
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
  const [agreed, setAgreed] = useState(false)

  if (!item) return null

  // Points Calculation for Projection
  const isArticle = item.subtype?.includes('Artículo');
  const journalCategory = item.metadata?.journalCategory || 'NO_CATEGORIZADA';
  const totalAuthors = item.totalAuthors || 1;
  
  const basePointsForProjection = isArticle 
    ? getArticleBasePoints(journalCategory) 
    : (item.points || 0);
  
  const projectedPoints = isArticle 
    ? calculateIndexedArticlePoints(journalCategory, totalAuthors)
    : (item.points || 0);

  // Author restriction multiplier display
  const getMultiplierLabel = () => {
    if (totalAuthors <= 3) return "100%";
    if (totalAuthors <= 5) return "50%";
    return "Dividido";
  }

  // Determine required files based on subtype
  const getRequiredFiles = () => {
    const s = item.subtype || '';
    if (item.type === 'TITULO') {
       const base = ['Diploma o Acta de Grado'];
       if (item.metadata?.country && item.metadata.country.toLowerCase() !== 'colombia') {
          base.push('Resolución de Convalidación (MinEducación)');
       }
       return base;
    }
    if (s.includes('Artículo')) return ['Archivo del Artículo (PDF)'];
    if (s.includes('Libro') || s.includes('Capítulo')) return ['Archivo del Libro / Capítulo'];
    if (s.includes('Ponencia')) return ['Memorias del Evento', 'Certificado de Ponente'];
    if (s.includes('Software')) return ['Manual de Usuario', 'ZIP con Software / Código', 'Cesión de Derechos (PDF)'];
    if (s.includes('Premio')) return ['Certificado del Premio', 'Reglamentación de Convocatoria'];
    
    return ['Documento Soporte / Evidencia'];
  }

  const requiredFiles = getRequiredFiles();

  const handleFileUpload = async (label: string, file: File) => {
    setUploadingFiles(prev => ({ ...prev, [label]: true }))
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await uploadFile(formData)
    console.log('Upload Result:', res)
    if (res.success && res.url) {
      setEvidence(prev => ({ ...prev, [label]: res.url }))
    } else {
      alert('Error subiendo archivo: ' + (res.error || 'Unknown error'))
    }
    setUploadingFiles(prev => ({ ...prev, [label]: false }))
  }

  async function handleSubmit() {
    if (!agreed) {
       alert('Debe aceptar la Declaración de Responsabilidad Ética.');
       return;
    }

    // Check if all required files are present
    const isMissingEvidence = requiredFiles.some(f => !evidence[f]);

    setLoading(true)
    const submissionData = {
      recognitionType,
      evidence,
      agreedDate: new Date().toISOString(),
      pointProjection: projectedPoints
    }

    const res = await sendToCiarp(item._id, submissionData)
    if (res.success) {
      onClose()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

    // Check if all required files are present
    const isMissingEvidence = requiredFiles.some(f => !evidence[f]);

    const canSubmit = !loading && agreed && !isMissingEvidence;

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/50">
           <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Solicitud de Reconocimiento CIARP</p>
              <h2 className="text-2xl font-serif text-slate-800 italic">Radicación de {item.subtype}</h2>
           </div>
           <button onClick={onClose} className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all border border-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-10 overflow-y-auto grow custom-scrollbar space-y-10">
           {/* Step 1: Recognition Type */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Reconocimiento Solicitado</label>
                 <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => setRecognitionType('SALARIAL')}
                      className={cn("p-5 rounded-2xl border-2 text-left transition-all", recognitionType === 'SALARIAL' ? "border-primary bg-emerald-50/30" : "border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200")}
                    >
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800">Puntos Salariales (Permanente)</span>
                          {recognitionType === 'SALARIAL' && <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white"><Check className="h-3 w-3" /></div>}
                       </div>
                       <p className="text-[10px] text-slate-400">Afecta el sueldo básico de forma permanente.</p>
                    </button>
                    <button 
                      onClick={() => setRecognitionType('BONO')}
                      className={cn("p-5 rounded-2xl border-2 text-left transition-all", recognitionType === 'BONO' ? "border-primary bg-emerald-50/30" : "border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200")}
                    >
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-800">Bonificación (No constitutiva)</span>
                          {recognitionType === 'BONO' && <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white"><Check className="h-3 w-3" /></div>}
                       </div>
                       <p className="text-[10px] text-slate-400">Pago único o por vigencia, no afecta prestacionalmente.</p>
                    </button>
                 </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                 <div className="flex items-center justify-between mb-6">
                    <Calculator className="h-8 w-8 text-emerald-400" />
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-bold uppercase tracking-widest text-emerald-300 border border-white/5">Estimador Decreto 1279</span>
                 </div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Proyección de Puntos</p>
                 <h4 className="text-5xl font-serif italic text-emerald-400">{projectedPoints || '0'}<span className="text-xs font-sans not-italic text-white/40 ml-2">pts</span></h4>
                 
                 {isArticle && (
                   <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-slate-400 border-t border-white/5 pt-4">
                        <span className="flex items-center gap-1"><Newspaper className="h-3 w-3" /> Revista ({journalCategory})</span>
                        <span className="text-white">{basePointsForProjection} pts</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Factor Autores ({totalAuthors})</span>
                        <span className="text-white">x {getMultiplierLabel()}</span>
                      </div>
                   </div>
                 )}

                 <div className="mt-8 pt-6 border-t border-white/5 flex items-start gap-3">
                    <Info className="h-4 w-4 text-slate-500 shrink-0" />
                    <p className="text-[9px] text-slate-400 leading-relaxed italic">* Valor estimado según la tipología del producto y el Decreto 1279. El comité definirá el puntaje final tras evaluación.</p>
                 </div>
              </div>
           </div>

           {/* Step 2: Evidence Upload */}
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <FileBadge className="h-4 w-4 text-primary" /> Soportes y Evidencias (PDF)
                 </h4>
                 <span className="text-[9px] font-medium text-slate-400">{Object.keys(evidence).length} de {requiredFiles.length} adjuntos</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {requiredFiles.map((label, idx) => (
                   <div key={idx} className={cn("p-6 rounded-3xl border-2 transition-all relative overflow-hidden group", evidence[label] ? "border-emerald-100 bg-emerald-50/20" : "border-dashed border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200")}>
                      {!evidence[label] && !uploadingFiles[label] && (
                        <input 
                          type="file" 
                          accept=".pdf,.zip" 
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(label, e.target.files[0])
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-50 w-full h-full"
                        />
                      )}
                      <div className="flex items-center justify-between relative z-10">
                         <div className="flex items-center gap-4">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", evidence[label] ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-300")}>
                               {evidence[label] ? <Check className="h-5 w-5" /> : <Upload className="h-5 w-5 border-none" />}
                            </div>
                             <div>
                                <p className={cn("text-xs font-bold", evidence[label] ? "text-emerald-900" : "text-slate-600")}>{label}</p>
                                <p className="text-[9px] text-slate-400">{uploadingFiles[label] ? 'Subiendo...' : evidence[label] ? 'Documento cargado' : 'Haga clic para adjuntar'}</p>
                             </div>
                          </div>
                          {evidence[label] ? (
                            <button onClick={() => setEvidence(prev => { const n = {...prev}; delete n[label]; return n; })} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                               <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <div className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest relative z-10 pointer-events-none">
                               Adjuntar
                            </div>
                          )}
                       </div>
                      {uploadingFiles[label] && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                           <div className="h-1 bg-slate-100 w-32 rounded-full overflow-hidden">
                              <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1 }} className="h-full bg-primary" />
                           </div>
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </div>

           {/* Step 3: Responsibility Declaration */}
           <div className={cn("p-8 rounded-[2.5rem] border-2 transition-all", agreed ? "bg-primary/5 border-primary/20" : "bg-slate-50/50 border-slate-50")}>
              <div className="flex items-start gap-5">
                 <button 
                  onClick={() => setAgreed(!agreed)}
                  className={cn("h-7 w-7 rounded-lg grow-0 shrink-0 border-2 flex items-center justify-center transition-all", agreed ? "bg-primary border-primary text-white" : "bg-white border-slate-200")}
                 >
                    {agreed && <Check className="h-4 w-4" />}
                 </button>
                 <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Declaración de Responsabilidad Ética</h5>
                    <p className="text-[10px] text-slate-500 italic leading-relaxed">
                      "Certifico que la información y soportes suministrados son verídicos. Conozco las implicaciones legales del Decreto 1279 de 2002 sobre propiedad intelectual y radicación de productos académicos."
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-50 bg-slate-50 flex items-center justify-end gap-4 shrink-0">
           <Button variant="ghost" onClick={onClose} className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Cancelar</Button>
           <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit} 
            className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 flex items-center gap-2 group disabled:opacity-50 disabled:bg-slate-300"
          >
             {loading ? 'Procesando...' : (
               <>Radicar Solicitud <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
             )}
           </Button>
        </div>
      </motion.div>
    </div>
  )
}
