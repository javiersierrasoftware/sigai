'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Search, Plus, UserPlus, Check, Trash2, 
  HelpCircle, Calendar, GraduationCap, BookOpen, 
  Settings, Award, Globe, FileText, Briefcase,
  Link, Hash, AtSign, MapPin, Target
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { 
  searchInternalAuthors, 
  createAcademicItem, 
  updateAcademicItem,
  lookupJournalByIssn,
  getResearchLines
} from "@/lib/actions/academic-actions"
import { cn } from "@/lib/utils"

interface Props {
  isOpen: boolean
  onClose: () => void
  user: any
  initialItem?: any // Item for editing
}

const MERIT_TYPES = [
  { id: 'TI', label: 'Título Académico', type: 'TITULO' },
  { id: 'AI', label: 'Artículo Indexado', type: 'PRODUCCION' },
  { id: 'AN', label: 'Artículo No Indexado', type: 'PRODUCCION' },
  { id: 'LI', label: 'Libro', type: 'PRODUCCION' },
  { id: 'CL', label: 'Capítulo de Libro', type: 'PRODUCCION' },
  { id: 'PA', label: 'Patente de Invención', type: 'PRODUCCION' },
  { id: 'SO', label: 'Software / App', type: 'PRODUCCION' },
  { id: 'PO', label: 'Ponencia', type: 'PRODUCCION' },
  { id: 'PT', label: 'Producción técnica', type: 'PRODUCCION' },
  { id: 'EX', label: 'Experiencia Calificada', type: 'EXPERIENCIA' },
  { id: 'CD', label: 'Categoría Docente', type: 'CATEGORIA' },
  { id: 'PR', label: 'Premio', type: 'PREMIO' },
]

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export default function MeritRegistrationModal({ isOpen, onClose, user, initialItem }: Props) {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // FORM FIELDS
  const [title, setTitle] = useState('')
  const [institution, setInstitution] = useState('')
  const [date, setDate] = useState('')
  const [totalAuthors, setTotalAuthors] = useState(1)
  const [metadata, setMetadata] = useState<any>({ scope: 'Nacional' })
  const [authors, setAuthors] = useState<any[]>([
    { userId: user.id || user._id, name: user.fullName, type: 'INTERNAL' }
  ])
  const [researchLine, setResearchLine] = useState('')
  const [keywords, setKeywords] = useState('')
  const [allResearchLines, setAllResearchLines] = useState<any[]>([])

  // SEARCH FOR CO-AUTHORS
  const [authorSearch, setAuthorSearch] = useState('')
  const [externalInstitution, setExternalInstitution] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Hydrate form if editing
  useEffect(() => {
    if (initialItem && isOpen) {
      setTitle(initialItem.title || '')
      setInstitution(initialItem.institution || '')
      setDate(initialItem.date ? new Date(initialItem.initialDate || initialItem.date).toISOString().split('T')[0] : '')
      setTotalAuthors(initialItem.totalAuthors || 1)
      setMetadata(initialItem.metadata || {})
      setIssn(initialItem.metadata?.issn || '')
      setAuthors(initialItem.authors || [])
      
      const type = MERIT_TYPES.find(t => t.label === initialItem.subtype || t.type === initialItem.type)
      setSelectedType(type || MERIT_TYPES[1])
      setResearchLine(initialItem.researchLine || '')
      setKeywords(Array.isArray(initialItem.keywords) ? initialItem.keywords.join(', ') : '')
      setStep(2)
    } else if (!isOpen) {
       resetForm()
    }
  }, [initialItem, isOpen])

  // Fetch Research Lines
  useEffect(() => {
    async function fetchLines() {
      const res = await getResearchLines()
      if (res.success) setAllResearchLines(res.data)
    }
    fetchLines()
  }, [])

  // ISSN Masking & Lookup
  const [issn, setIssn] = useState('')

  useEffect(() => {
    if (authorSearch.length > 2) {
      const timer = setTimeout(async () => {
        const res = await searchInternalAuthors(authorSearch)
        if (res.success) setSearchResults(res.data)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [authorSearch])

  // AUTO-CALC YEARS FOR EXPERIENCE
  useEffect(() => {
    if (selectedType?.id === 'EX' && metadata.startDate && metadata.endDate) {
      const start = new Date(metadata.startDate)
      const end = new Date(metadata.endDate)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffInMs = end.getTime() - start.getTime()
        const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25)
        const rounded = diffInYears > 0 ? diffInYears.toFixed(1) : "0"
        if (metadata.totalYears !== rounded) {
          handleMetadataChange('totalYears', rounded)
        }
      }
    }
  }, [metadata.startDate, metadata.endDate, selectedType])

  const resetForm = () => {
    setTitle('')
    setInstitution('')
    setDate('')
    setTotalAuthors(1)
    setMetadata({ scope: 'Nacional' })
    setAuthors([{ userId: user.id || user._id, name: user.fullName, type: 'INTERNAL' }])
    setIssn('')
    setAuthorSearch('')
    setExternalInstitution('')
    setSearchResults([])
    setResearchLine('')
    setKeywords('')
  }

  const handleIssnChange = async (val: string) => {
    let raw = val.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    let formatted = raw;
    if (raw.length > 4) formatted = raw.substring(0, 4) + '-' + raw.substring(4);
    setIssn(formatted);
    handleMetadataChange('issn', formatted);

    if (formatted.length === 9) {
       const res = await lookupJournalByIssn(formatted);
       if (res.success && res.data) {
          handleMetadataChange('journalName', res.data.name);
          if (res.data.category) handleMetadataChange('journalCategory', res.data.category);
       }
    }
  }

  const addInternalAuthor = (u: any) => {
    if (authors.some(a => a.userId === u._id)) return
    setAuthors([...authors, { userId: u._id, name: u.fullName, type: 'INTERNAL' }])
    setAuthorSearch('')
  }

  const addExternalAuthor = () => {
    if (!authorSearch) return
    setAuthors([...authors, { name: authorSearch, institution: externalInstitution, type: 'EXTERNAL' }])
    setAuthorSearch('')
    setExternalInstitution('')
  }

  const removeAuthor = (idx: number) => {
    if (authors[idx].userId === (user.id || user._id)) return
    setAuthors(authors.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    // Basic validation
    if (!title && selectedType.id !== 'EX') {
       alert('Por favor complete el título del producto.');
       return;
    }

    if (selectedType.id === 'EX' && (!metadata.startDate || !metadata.endDate)) {
       alert('Debe indicar las fechas inicial y final de la experiencia.');
       return;
    }

    if (selectedType.type === 'PRODUCCION' && authors.length < totalAuthors) {
       alert(`Debe registrar los ${totalAuthors} autores indicados en el documento.`);
       return;
    }

    setLoading(true)
    const isIndividualMerit = selectedType.type === 'TITULO' || selectedType.type === 'CATEGORIA' || selectedType.id === 'EX';

    const finalTitle = selectedType.id === 'EX' ? `Experiencia en ${metadata.institution || institution || 'Entidad Externa'}` : title;
    const finalDate = selectedType.id === 'EX' ? (metadata.startDate || new Date().toISOString().split('T')[0]) : date;

    if (!finalDate) {
       alert('Por favor complete la fecha de este registro.');
       setLoading(false);
       return;
    }

    if (!researchLine) {
       alert('Debe seleccionar la Línea de Investigación Institucional.');
       setLoading(false);
       return;
    }

    const kwArray = keywords.split(',').map(s => s.trim()).filter(Boolean);
    if (kwArray.length < 5) {
       alert('Debe especificar por lo menos 5 palabras clave separadas por comas.');
       setLoading(false);
       return;
    }

    const data = {
      type: selectedType.type,
      subtype: selectedType.label,
      title: finalTitle,
      institution,
      date: finalDate,
      radicationDate: new Date().toISOString().split('T')[0],
      totalAuthors: isIndividualMerit ? 1 : Math.max(totalAuthors, authors.length),
      authors: isIndividualMerit ? [{ userId: user.id || user._id, name: user.fullName, type: 'INTERNAL' }] : authors,
      researchLine: researchLine,
      keywords: keywords.split(',').map(s => s.trim()).filter(s => s !== ''),
      metadata
    }

    const res = initialItem?._id 
      ? await updateAcademicItem(initialItem._id, data)
      : await createAcademicItem(data)

    if (res.success) {
      resetForm()
      setStep(1)
      onClose()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleMetadataChange = (key: string, val: any) => {
    setMetadata((prev: any) => ({ ...prev, [key]: val }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[98vh] relative z-10">
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex items-center justify-between shrink-0">
           <div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mb-2">{selectedType ? selectedType.label : 'Paso 1: Selección'}</p>
              <h2 className="text-3xl font-serif text-slate-800 italic">{initialItem ? 'Editar' : 'Registrar'} Mérito Académico</h2>
           </div>
           <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all">
              <X className="h-6 w-6" />
           </button>
        </div>

        {/* Content */}
        <div className="p-12 overflow-y-auto grow custom-scrollbar">
           {step === 1 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MERIT_TYPES.map((mt) => (
                   <button key={mt.id} onClick={() => { setSelectedType(mt); setStep(2); }} className="p-6 rounded-3xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 text-left group">
                      <div className="h-8 w-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-3 font-bold uppercase text-[8px]">
                         {mt.id}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-tight">{mt.label}</span>
                   </button>
                ))}
             </div>
           ) : (
             <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* TYPE SELECTOR */}
                   <div className="md:col-span-2 space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tipo de Mérito / Producto</label>
                      <select value={selectedType?.id} onChange={(e) => { const mt = MERIT_TYPES.find(m => m.id === e.target.value); if (mt) setSelectedType(mt); }} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none font-medium text-slate-700 text-xs shadow-inner appearance-none">
                         {MERIT_TYPES.map(mt => (<option key={mt.id} value={mt.id}>{mt.label}</option>))}
                      </select>
                   </div>

                   {/* PRODUCT NAME */}
                   <div className={cn("md:col-span-2 space-y-3", selectedType.id === 'CL' && "md:col-span-1")}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                        {selectedType.id === 'TI' ? 'Título Académico del Diploma' : 
                         selectedType.id === 'CL' ? 'Nombre del Capítulo' :
                         selectedType.id === 'LI' ? 'Título Oficial del Libro' :
                         selectedType.id === 'PR' ? 'Título Oficial del Premio' :
                         selectedType.id === 'PT' ? 'Título de Producción Técnica' :
                         selectedType.id === 'PA' ? 'Título de Patente' :
                         selectedType.id === 'SO' ? 'Título de Software / App' :
                         selectedType.id === 'CD' ? 'Categoría Alcanzada' :
                         'Nombre Oficial del Producto'}
                      </label>
                      {selectedType.id === 'CD' ? (
                        <select 
                          value={title} 
                          onChange={e => setTitle(e.target.value)}
                          className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-700 text-xs shadow-inner appearance-none"
                        >
                           <option value="">-- Seleccionar Categoría --</option>
                           <option value="Docente Auxiliar">Docente Auxiliar</option>
                           <option value="Docente Asistente">Docente Asistente</option>
                           <option value="Docente Asociado">Docente Asociado</option>
                           <option value="Docente Titular">Docente Titular</option>
                           <option value="Instructor">Instructor</option>
                        </select>
                      ) : (
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Escriba el título exacto..." className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none font-medium text-xs shadow-inner" />
                      )}
                   </div>

                   {selectedType.id === 'TI' && (
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nivel Académico</label>
                        <select 
                          value={metadata.level || ''} 
                          onChange={e => handleMetadataChange('level', e.target.value)}
                          className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-700 text-xs shadow-inner appearance-none"
                        >
                           <option value="">-- Seleccionar Nivel --</option>
                           <option value="Pregrado">Técnico / Tecnólogo / Pregrado</option>
                           <option value="Especialización">Especialización</option>
                           <option value="Maestría">Maestría</option>
                           <option value="Doctorado">Doctorado</option>
                           <option value="Postdoctorado">Postdoctorado</option>
                        </select>
                     </div>
                   )}

                   {/* INTERNAL BOOK TITLE FOR CHAPTER */}
                   {selectedType.id === 'CL' && (
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Título del Libro (Completo)</label>
                        <input type="text" onChange={e => handleMetadataChange('bookTitle', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none font-medium text-xs shadow-inner" />
                     </div>
                   )}

                   {/* ARTICLE FIELDS */}
                   {(selectedType.id === 'AI' || selectedType.id === 'AN') && (
                     <>
                       <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">ISSN {selectedType.id === 'AI' ? '(Requerido)' : '(Opcional)'}</label>
                        <input type="text" value={issn} onChange={e => handleIssnChange(e.target.value)} placeholder="XXXX-XXXX" className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                       </div>
                       <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre de la Revista</label>
                        <input type="text" value={metadata.journalName || ''} onChange={e => handleMetadataChange('journalName', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                       </div>
                       {selectedType.id === 'AI' && (
                         <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Categoría Revista (MinCiencias)</label>
                           <select 
                            value={metadata.journalCategory || ''} 
                            onChange={e => handleMetadataChange('journalCategory', e.target.value)} 
                            className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium appearance-none font-bold"
                           >
                              <option value="">-- Seleccionar --</option>
                              <option value="A1">Categoría A1</option>
                              <option value="A2">Categoría A2 (A)</option>
                              <option value="B">Categoría B</option>
                              <option value="C">Categoría C</option>
                           </select>
                         </div>
                       )}
                       <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">URL de Ubicación del Artículo</label>
                        <input type="url" value={metadata.url || ''} onChange={e => handleMetadataChange('url', e.target.value)} placeholder="https://..." className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                       </div>
                     </>
                   )}

                   {/* BOOK / CHAPTER FIELDS */}
                   {(selectedType.id === 'LI' || selectedType.id === 'CL') && (
                     <>
                        <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">ISBN</label>
                         <input type="text" onChange={e => handleMetadataChange('isbn', e.target.value)} placeholder="978..." className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                        </div>
                        <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Editorial</label>
                         <input type="text" onChange={e => handleMetadataChange('editorial', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">País</label>
                             <input type="text" onChange={e => handleMetadataChange('country', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                           </div>
                           <div className="space-y-3">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ciudad</label>
                             <input type="text" onChange={e => handleMetadataChange('city', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mes de Publicación</label>
                             <select onChange={e => handleMetadataChange('publishMonth', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium appearance-none">
                                <option value="">-- Seleccionar --</option>
                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                             </select>
                           </div>
                           <div className="space-y-3">
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tiraje</label>
                             <input type="text" onChange={e => handleMetadataChange('printRun', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                           </div>
                        </div>
                        {selectedType.id === 'LI' && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tipo de Libro</label>
                            <select onChange={e => handleMetadataChange('bookType', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium appearance-none">
                               <option value="">-- Seleccionar --</option>
                               <option value="Investigación">Libro de Investigación</option>
                               <option value="Texto">Libro de Texto</option>
                               <option value="Ensayo">Libro de Ensayo</option>
                            </select>
                          </div>
                        )}
                     </>
                   )}

                   {/* PREMIO / PT / PA / SO / PONENCIA FIELDS */}
                   {(selectedType.id === 'PR' || selectedType.id === 'PT' || selectedType.id === 'PA' || selectedType.id === 'SO' || selectedType.id === 'PO') && (
                     <>
                        {selectedType.id !== 'PO' && (
                          <>
                            <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                {selectedType.id === 'PR' ? 'Acta / Certificación' : 
                                selectedType.id === 'PT' ? 'Registro / Patente' :
                                selectedType.id === 'PA' ? 'Código de Registro' :
                                'Registro DNDA'}
                            </label>
                            <input type="text" onChange={e => handleMetadataChange('referenceId', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                            </div>
                            <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                {selectedType.id === 'PR' || selectedType.id === 'PA' ? 'Entidad Otorgante' : 'Entidad de Registro'}
                            </label>
                            <input type="text" onChange={e => handleMetadataChange('issuingEntity', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                            </div>
                          </>
                        )}
                        {selectedType.id === 'PR' && (
                           <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ámbito</label>
                            <select onChange={e => handleMetadataChange('scope', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium appearance-none">
                               <option value="Nacional">Nacional</option>
                               <option value="Internacional">Internacional</option>
                            </select>
                           </div>
                        )}
                        {selectedType.id === 'PT' && (
                           <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Link Ejecutable / Evidencia</label>
                            <input type="url" onChange={e => handleMetadataChange('url', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                           </div>
                        )}
                        {selectedType.id === 'SO' && (
                          <>
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Plataforma o Lenguaje</label>
                              <input type="text" onChange={e => handleMetadataChange('platform', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Versión del Software</label>
                              <input type="text" onChange={e => handleMetadataChange('version', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                            </div>
                          </>
                        )}
                        {selectedType.id === 'PO' && (
                          <>
                             <div className="md:col-span-2 space-y-3">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombre del Evento</label>
                               <input type="text" onChange={e => handleMetadataChange('eventName', e.target.value)} placeholder="Ej. Congreso Internacional de IA" className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                             </div>
                             <div className="space-y-3">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Fecha del Evento</label>
                               <input type="date" onChange={e => handleMetadataChange('eventDate', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                             </div>
                             <div className="space-y-3">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ámbito del Evento</label>
                               <select onChange={e => handleMetadataChange('scope', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium appearance-none">
                                  <option value="Local">Local</option>
                                  <option value="Nacional">Nacional</option>
                                  <option value="Internacional">Internacional</option>
                               </select>
                             </div>
                             <div className="md:col-span-2 space-y-3">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">URL de Memorias del Evento (Opcional)</label>
                               <input type="url" onChange={e => handleMetadataChange('url', e.target.value)} placeholder="https://..." className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                             </div>
                             <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                <div className="space-y-3">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">País</label>
                                  <input type="text" onChange={e => handleMetadataChange('country', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                                </div>
                                <div className="space-y-3">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ciudad</label>
                                  <input type="text" onChange={e => handleMetadataChange('city', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                                </div>
                             </div>
                             <div className="md:col-span-2 space-y-3">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Idioma de la Ponencia</label>
                               <input type="text" onChange={e => handleMetadataChange('language', e.target.value)} placeholder="Español, Inglés, etc." className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                             </div>
                          </>
                        )}
                     </>
                   )}

                   {/* QUALIFIED EXPERIENCE FIELDS */}
                   {selectedType.id === 'EX' && (
                     <>
                        <div className="md:col-span-2 space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Entidad / Institución</label>
                          <input type="text" onChange={e => handleMetadataChange('institution', e.target.value)} placeholder="Nombre de la Empresa o Universidad" className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                        </div>
                        <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tipo de Vinculación</label>
                         <select onChange={e => handleMetadataChange('linkageType', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium appearance-none font-bold italic">
                            <option value="">-- Seleccionar --</option>
                            <option value="CONTRATO_LABORAL">Contrato Laboral</option>
                            <option value="PRESTACION_SERVICIOS">Prestación de Servicios (No puntuable)</option>
                         </select>
                        </div>
                        <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tipo de Experiencia</label>
                         <select onChange={e => handleMetadataChange('experienceType', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium appearance-none">
                            <option value="">-- Seleccionar --</option>
                            <option value="Docencia Universitaria">Docencia Universitaria</option>
                            <option value="Experiencia Profesional Dirigida">Experiencia Profesional Dirigida</option>
                            <option value="Investigación pura">Investigación pura</option>
                         </select>
                        </div>
                        <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Fecha Inicial</label>
                         <input type="date" onChange={e => handleMetadataChange('startDate', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                        </div>
                        <div className="space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Fecha Final</label>
                         <input type="date" onChange={e => handleMetadataChange('endDate', e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tiempo Total (Años)</label>
                         <div className="w-full px-8 py-5 bg-slate-100/50 border-dashed border-2 border-slate-200 rounded-[1.5rem] text-slate-500 font-bold text-lg">
                            {metadata.totalYears || "0.0"} <span className="text-[10px] uppercase tracking-widest ml-2">Años Calculados</span>
                         </div>
                        </div>
                     </>
                   )}

                   {/* COMMON: Date */}
                   {(selectedType.id !== 'EX' && selectedType.id !== 'PO') && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                          {selectedType.id === 'PR' ? 'Año del Premio' : 
                            selectedType.id === 'PA' ? 'Año de Otorgamiento' :
                            selectedType.id === 'SO' ? 'Año de Registro' :
                            selectedType.id === 'PT' ? 'Año de Producción' :
                            'Fecha de Publicación / Grado'}
                        </label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium" />
                    </div>
                   )}

                   {/* INSTITUTIONAL LINE & KEYWORDS */}
                   <div className="md:col-span-2 pt-8 border-t border-slate-50 space-y-8">
                     <div>
                        <h4 className="flex items-center gap-2 text-xs font-serif text-slate-800 italic mb-1"><Target className="h-4 w-4 text-primary" /> Clasificación y Temáticas</h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">VINCULACIÓN INSTITUCIONAL</p>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Línea de Investigación Institucional</label>
                           <select 
                              value={researchLine} 
                              onChange={e => setResearchLine(e.target.value)}
                              className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-semibold shadow-inner appearance-none transition-all hover:bg-slate-100"
                              required
                           >
                              <option value="">-- Seleccionar Línea --</option>
                              {allResearchLines.map(l => (
                                 <option key={l._id} value={l._id}>{l.name}</option>
                              ))}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center justify-between">
                              Palabras Clave (mínimo 5)
                              <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">Separadas por coma</span>
                           </label>
                           <div className="relative">
                              <Hash className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                              <input 
                                 type="text" 
                                 value={keywords} 
                                 onChange={e => setKeywords(e.target.value)}
                                 placeholder="Ej: inteligencia artificial, docencia, algoritmos, IA, desarrollo..."
                                 className="w-full pl-14 pr-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-semibold shadow-inner transition-all hover:bg-slate-100 placeholder:text-slate-300 italic" 
                                 required
                              />
                           </div>
                        </div>
                     </div>
                   </div>

                   {/* TOTAL AUTHORS (Most Production Types) */}
                   {selectedType.type === 'PRODUCCION' && (
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nº Total de Autores del Producto</label>
                        <input type="number" min="1" value={totalAuthors} onChange={e => setTotalAuthors(Number(e.target.value))} className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-[1.5rem] outline-none text-xs font-medium shadow-inner" />
                     </div>
                   )}

                   {/* CO-AUTHORS LIST */}
                   {(selectedType.type !== 'TITULO' && selectedType.type !== 'CATEGORIA' && selectedType.id !== 'EX') && (
                     <div className="md:col-span-2 space-y-8 pt-8 border-t border-slate-50">
                        <div className="flex items-center justify-between">
                           <div>
                              <h4 className="flex items-center gap-2 text-xs font-serif text-slate-800 italic mb-1"><UserPlus className="h-4 w-4" /> Autores Adicionales</h4>
                              <p className="text-[10px] text-slate-400">{authors.length} de {totalAuthors || 1} vinculados</p>
                           </div>
                           {(totalAuthors || 1) > authors.length && (
                             <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-bold uppercase tracking-widest rounded-full border border-amber-100">Pendiente: {(totalAuthors || 1) - authors.length}</span>
                           )}
                        </div>
                        


                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <div className="relative">
                                 <input type="text" placeholder="Buscar docente o escribir nombre..." value={authorSearch} onChange={e => setAuthorSearch(e.target.value)} className="w-full px-8 py-5 bg-slate-100/50 border-transparent rounded-2xl outline-none text-xs font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all" />
                                 <AnimatePresence>
                                   {searchResults.length > 0 && (
                                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute inset-x-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-40 overflow-y-auto">
                                       {searchResults.map((u) => (
                                         <button key={u._id} onClick={() => addInternalAuthor(u)} className="w-full p-4 hover:bg-emerald-50 text-left border-b border-slate-50 flex items-center justify-between group">
                                            <div>
                                               <p className="text-xs font-bold text-slate-800">{u.fullName}</p>
                                               <p className="text-[9px] text-slate-400">{u.email}</p>
                                            </div>
                                            <div className="h-8 w-8 rounded-lg bg-emerald-100/50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="h-4 w-4" /></div>
                                         </button>
                                       ))}
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                              </div>
                              <input type="text" placeholder="Institución / Universidad" value={externalInstitution} onChange={e => setExternalInstitution(e.target.value)} className="w-full px-8 py-5 bg-slate-100/50 border-transparent rounded-2xl outline-none text-xs font-medium" />
                              <Button type="button" onClick={addExternalAuthor} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200">Vincular Autor Externo</Button>
                           </div>

                           <div className="space-y-3">
                              {authors.map((author, i) => (
                                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                       <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs uppercase">
                                          {author.name.substring(0,2)}
                                       </div>
                                       <div>
                                          <p className="text-xs font-bold text-slate-800">{author.name} {author.userId === (user.id || user._id) ? "(Tú)" : ""}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{author.type === 'INTERNAL' ? 'Interno Unisucre' : (author.institution || 'Externo')}</p>
                                       </div>
                                    </div>
                                    {author.userId !== (user.id || user._id) && (
                                      <button onClick={() => removeAuthor(i)} className="h-8 w-8 rounded-lg flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                   )}
                </div>

                <div className="flex items-center justify-end gap-4 pt-10 mt-10 border-t border-slate-50">
                   <Button variant="ghost" onClick={() => setStep(1)} className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-400">Paso Anterior</Button>
                   <Button onClick={handleSubmit} disabled={loading} className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-200">
                     {loading ? 'Guardando...' : 'Finalizar Registro'}
                   </Button>
                </div>
             </div>
           )}
        </div>
      </motion.div>
    </div>
  )
}
