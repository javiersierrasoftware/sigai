'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User as UserIcon, 
  GraduationCap, 
  Target, 
  Globe, 
  Save, 
  Check, 
  ChevronRight,
  ChevronLeft,
  Search,
  BookOpen,
  ArrowRight,
  Globe2,
  ExternalLink,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { updateUserProfile } from "@/lib/actions/user-actions"
import { uploadFile } from "@/lib/actions/storage-actions"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface Props {
  user: any
  faculties: any[]
  allPrograms: any[]
  researchLines: any[]
  researchGroups: any[]
}

const SECTIONS = [
  { id: 'BASIC', label: 'Datos Básicos', icon: UserIcon },
  { id: 'ACADEMIC', label: 'Info Académica', icon: GraduationCap },
  { id: 'IMPACT', label: 'Impacto y ODS', icon: Target },
  { id: 'RESEARCH', label: 'Perfil Investigador', icon: Globe }
]

const ODS_LIST = [
  "1. Fin de la pobreza", "2. Hambre cero", "3. Salud y bienestar", "4. Educación de calidad",
  "5. Igualdad de género", "6. Agua limpia y saneamiento", "7. Energía asequible", "8. Trabajo decente",
  "9. Industria e innovación", "10. Reducción de desigualdades", "11. Ciudades sostenibles",
  "12. Consumo responsable", "13. Acción por el clima", "14. Vida submarina",
  "15. Vida de ecosistemas", "16. Paz y justicia", "17. Alianzas"
]

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export default function ProfileEditClient({ user, faculties, allPrograms, researchLines, researchGroups }: Props) {
  const [activeSection, setActiveSection] = useState('BASIC')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // GLOBAL STATE FOR ALL FIELDS (to prevent data loss when switching tabs)
  const [fullName, setFullName] = useState(user.fullName || '')
  const [facultyId, setFacultyId] = useState(user.profile?.faculty?._id || user.profile?.faculty || '')
  const [programId, setProgramId] = useState(user.profile?.program?._id || user.profile?.program || '')
  const [joiningMonth, setJoiningMonth] = useState(user.profile?.joiningMonth || 'Enero')
  const [joiningYear, setJoiningYear] = useState(user.profile?.joiningYear || '2024')
  const [contractType, setContractType] = useState(user.profile?.contractType || 'Carrera')
  
  const [selectedODS, setSelectedODS] = useState<string[]>(user.profile?.ods || [])
  const [selectedLines, setSelectedLines] = useState<string[]>(user.profile?.researchLines?.map((l:any) => l._id || l) || [])
  const [selectedGroups, setSelectedGroups] = useState<string[]>(user.profile?.researchGroups?.map((g:any) => g._id || g) || [])
  
  const [mincienciasCategory, setMincienciasCategory] = useState(user.profile?.mincienciasCategory || 'No Categorizado')
  const [cvlacUrl, setCvlacUrl] = useState(user.profile?.cvlacUrl || '')
  const [areasInput, setAreasInput] = useState(user.profile?.researchAreas?.join(', ') || '')
  const [biography, setBiography] = useState(user.profile?.biography || '')
  const [orcidId, setOrcidId] = useState(user.profile?.orcidId || '')
  const [orcidUrl, setOrcidUrl] = useState(user.profile?.orcidUrl || '')
  const [googleScholarUrl, setGoogleScholarUrl] = useState(user.profile?.googleScholarUrl || '')
  const [profilePicture, setProfilePicture] = useState(user.profile?.profilePicture || '')
  const [birthDate, setBirthDate] = useState(user.profile?.birthDate || '')
  const [gender, setGender] = useState(user.profile?.gender || 'No Definido')
  const [differentialFocus, setDifferentialFocus] = useState(user.profile?.differentialFocus || 'Ninguno')
  const [hasDisability, setHasDisability] = useState(user.profile?.hasDisability || false)
  const [disabilityType, setDisabilityType] = useState(user.profile?.disabilityType || 'Ninguna')
  const [uploading, setUploading] = useState(false)
  const isInitialMount = useRef(true)
  
  const [groupSearch, setGroupSearch] = useState('')

  // SYNC STATE WITH PROPS (Only on changes that are NOT coming from our local edits)
  useEffect(() => {
    if (user && isInitialMount.current) {
      setFullName(user.fullName || '')
      setFacultyId(user.profile?.faculty?._id || user.profile?.faculty || '')
      setProgramId(user.profile?.program?._id || user.profile?.program || '')
      setJoiningMonth(user.profile?.joiningMonth || 'Enero')
      setJoiningYear(user.profile?.joiningYear || '2024')
      setContractType(user.profile?.contractType || 'Carrera')
      setSelectedODS(user.profile?.ods || [])
      setSelectedLines(user.profile?.researchLines?.map((l:any) => l._id || l) || [])
      setSelectedGroups(user.profile?.researchGroups?.map((g:any) => g._id || g) || [])
      setMincienciasCategory(user.profile?.mincienciasCategory || 'No Categorizado')
      setCvlacUrl(user.profile?.cvlacUrl || '')
      setAreasInput(user.profile?.researchAreas?.join(', ') || '')
      setBiography(user.profile?.biography || '')
      setOrcidId(user.profile?.orcidId || '')
      setOrcidUrl(user.profile?.orcidUrl || '')
      setGoogleScholarUrl(user.profile?.googleScholarUrl || '')
      setProfilePicture(user.profile?.profilePicture || '')
      setBirthDate(user.profile?.birthDate || '')
      setGender(user.profile?.gender || 'No Definido')
      setDifferentialFocus(user.profile?.differentialFocus || 'Ninguno')
      setHasDisability(user.profile?.hasDisability || false)
      setDisabilityType(user.profile?.disabilityType || 'Ninguna')
      
      isInitialMount.current = false;
    }
  }, [user])

  // Computed: filtered programs
  const filteredPrograms = useMemo(() => {
    return allPrograms.filter(p => p.faculty === facultyId || (p.faculty as any)?._id === facultyId)
  }, [facultyId, allPrograms])

  const filteredGroups = useMemo(() => {
    return researchGroups.filter(g => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
  }, [groupSearch, researchGroups])
  
  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
     const file = e.target.files?.[0];
     if (!file) return;

     setUploading(true);
     const formData = new FormData();
     // We use a deterministic filename so the storage server can replace the old one if supported
     // otherwise, the DB will just store the latest URL.
     const fileName = `profile_${user.identification}.jpg`;
     formData.append('file', file, fileName);
     
     const res = await uploadFile(formData);
     if (res.success && res.url) {
        setProfilePicture(res.url);
     } else {
        alert(res.error || 'Error al subir la imagen');
     }
     setUploading(false);
  }

  async function handleGlobalSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData()
    formData.append('fullName', fullName)
    formData.append('faculty', facultyId)
    formData.append('program', programId)
    formData.append('joiningMonth', joiningMonth)
    formData.append('joiningYear', joiningYear)
    formData.append('contractType', contractType)
    formData.append('profilePicture', profilePicture)
    formData.append('birthDate', birthDate)
    formData.append('gender', gender)
    formData.append('differentialFocus', differentialFocus)
    formData.append('hasDisability', String(hasDisability))
    formData.append('disabilityType', disabilityType)
    
    formData.append('ods', JSON.stringify(selectedODS))
    formData.append('researchLines', JSON.stringify(selectedLines))
    formData.append('researchGroups', JSON.stringify(selectedGroups))
    formData.append('researchAreas', JSON.stringify(areasInput.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean)))
    
    formData.append('mincienciasCategory', mincienciasCategory)
    formData.append('cvlacUrl', cvlacUrl)
    formData.append('biography', biography)
    formData.append('orcidId', orcidId)
    formData.append('orcidUrl', orcidUrl)
    formData.append('googleScholarUrl', googleScholarUrl)
    
    const result = await updateUserProfile(formData)
    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-12 gap-y-8">
      {/* Informative Header (optional, but keep it clean) */}
      <div className="lg:col-span-4 mb-2">
        <h1 className="text-3xl font-serif text-slate-800 tracking-tight">Perfeccione su Perfil</h1>
        <p className="text-slate-400 mt-1 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Asegure su visibilidad en el ecosistema científico institucional con datos precisos</p>
      </div>

      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-3">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 group text-left mb-1",
                activeSection === sec.id 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "hover:bg-slate-50 text-slate-400 hover:text-slate-600"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                activeSection === sec.id ? "bg-white/10" : "bg-slate-100 group-hover:bg-white"
              )}>
                <sec.icon className="h-5 w-5" />
              </div>
              <span className="font-serif text-sm font-medium tracking-tight whitespace-nowrap">{sec.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-emerald-50 rounded-[2.5rem] p-8">
           <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">Completitud del perfil</p>
           <h4 className="text-4xl font-serif text-emerald-700 italic">85%</h4>
           <div className="mt-4 h-1.5 w-full bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
           </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="lg:col-span-3">
        <form onSubmit={handleGlobalSubmit}>
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-3xl font-serif text-slate-800 italic">
                {SECTIONS.find(s => s.id === activeSection)?.label}
             </h2>
             <Button 
               type="submit" 
               disabled={loading}
               className={cn(
                 "h-14 px-8 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all duration-500",
                 success ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary/95"
               )}
             >
                {loading ? 'Guardando...' : success ? <><Check className="mr-2 h-4 w-4" /> Guardado</> : <><Save className="mr-2 h-4 w-4" /> Guardar Perfil</>}
             </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-[3rem] border border-slate-50 shadow-sm p-12 min-h-[600px]"
            >
              {/* SECTION: BASIC */}
              {activeSection === 'BASIC' && (
                <div className="space-y-12">
                    <div className="flex flex-col items-center justify-center py-10 relative">
                       <input 
                         type="file" 
                         id="photo-upload" 
                         className="hidden" 
                         accept="image/*"
                         onChange={onPhotoChange}
                         disabled={uploading}
                       />
                       <label 
                         htmlFor="photo-upload"
                         className={cn(
                           "h-44 w-44 rounded-[3.5rem] bg-slate-100 flex items-center justify-center relative border-4 border-white shadow-2xl cursor-pointer hover:scale-[1.02] transition-all overflow-hidden group",
                           uploading && "opacity-50 pointer-events-none"
                         )}
                       >
                          {profilePicture ? (
                             <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                             <UserIcon className="h-20 w-20 text-slate-300" />
                          )}
                          
                          {uploading ? (
                             <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-sm">
                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                             </div>
                          ) : (
                             <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                                <Plus className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                             </div>
                          )}

                          <div className="absolute -right-1 -bottom-1 h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                             {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-6 w-6" />}
                          </div>
                       </label>
                       <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">FOTO DE PERFIL PROFESIONAL</p>
                    </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nombres y Apellidos</label>
                        <input 
                          type="text" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-slate-700 text-[11px]" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Identificación (C.C)</label>
                        <input type="text" disabled value={user.identification} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl opacity-50 outline-none font-medium text-slate-700 text-[11px]" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Institucional</label>
                        <input type="email" disabled value={user.email} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl opacity-50 outline-none font-medium text-slate-700 text-[11px]" />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Fecha de Nacimiento</label>
                        <input 
                          type="date" 
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-slate-700 text-[11px]" 
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sexo / Género (DANE/Minsalud)</label>
                        <select 
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-slate-700 text-[11px] appearance-none cursor-pointer"
                        >
                           <option value="Masculino">Masculino</option>
                           <option value="Femenino">Femenino</option>
                           <option value="No Binario">No Binario</option>
                           <option value="No Definido">Prefiero no decir</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Grupo de Enfoque Diferencial</label>
                        <select 
                          value={differentialFocus}
                          onChange={(e) => setDifferentialFocus(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-slate-700 text-[11px] appearance-none cursor-pointer"
                        >
                           <option value="Ninguno">Ninguno / No Aplica</option>
                           <option value="Afrodescendiente">Afrodescendiente / Negro / Mulato</option>
                           <option value="Indígena">Indígena</option>
                           <option value="Rrom">Rrom (Gitano)</option>
                           <option value="Palenquero">Palenquero de San Basilio</option>
                           <option value="Raizal">Raizal de San Andrés y Providencia</option>
                           <option value="Víctima del conflicto">Víctima del Conflicto Armado</option>
                           <option value="Reincorporado">Reincorporado / Desmovilizado</option>
                           <option value="Migrante">Migrante</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">¿Presenta alguna Discapacidad?</label>
                        <div className="flex items-center gap-4 mt-2 px-2">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="hasDisability"
                              checked={hasDisability} 
                              onChange={() => setHasDisability(true)}
                              className="h-4 w-4 accent-primary"
                            />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sí</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="hasDisability"
                              checked={!hasDisability} 
                              onChange={() => {
                                setHasDisability(false)
                                setDisabilityType('Ninguna')
                              }}
                              className="h-4 w-4 accent-primary"
                            />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">No</span>
                          </label>
                        </div>
                      </div>

                      {hasDisability && (
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tipo de Discapacidad</label>
                          <select 
                            value={disabilityType}
                            onChange={(e) => setDisabilityType(e.target.value)}
                            className="w-full px-6 py-4 bg-emerald-50/50 border-primary/10 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-slate-700 text-[11px] appearance-none cursor-pointer"
                          >
                             <option value="Física">Física (Movilidad)</option>
                             <option value="Auditiva">Auditiva</option>
                             <option value="Visual">Visual</option>
                             <option value="Sordoceguera">Sordoceguera</option>
                             <option value="Intelectual">Intelectual / Cognitiva</option>
                             <option value="Psicosocial">Psicosocial (Mental)</option>
                             <option value="Múltiple">Múltiple</option>
                             <option value="Otra">Otra / No especificada</option>
                          </select>
                        </div>
                      )}
                   </div>
                </div>
              )}

              {/* SECTION: ACADEMIC */}
              {activeSection === 'ACADEMIC' && (
                <div className="space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Facultad de Aval</label>
                        <select 
                          value={facultyId}
                          onChange={(e) => {
                            setFacultyId(e.target.value)
                            setProgramId('') // Reset program when faculty changes
                          }}
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-slate-700 appearance-none cursor-pointer text-xs"
                        >
                           <option value="">Seleccione Facultad...</option>
                           {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Programa Académico</label>
                        <select 
                          value={programId}
                          onChange={(e) => setProgramId(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-slate-700 appearance-none cursor-pointer text-xs"
                        >
                           <option value="">Seleccione Programa...</option>
                           {filteredPrograms.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>

                      <div className="md:col-span-1 grid grid-cols-2 gap-4">
                         <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mes Vinculación</label>
                           <select value={joiningMonth} onChange={(e) => setJoiningMonth(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-[11px] font-medium">
                              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                         </div>
                         <div className="space-y-3">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Año Vinculación</label>
                           <input type="number" value={joiningYear} onChange={(e) => setJoiningYear(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-xs" />
                         </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tipo de Contrato</label>
                        <select value={contractType} onChange={(e) => setContractType(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-[11px]">
                           <option value="Carrera">Profesor de Planta</option>
                           <option value="Catedrático">Profesor Catedrático</option>
                           <option value="Ocasional">Profesor Ocasional</option>
                        </select>
                      </div>
                   </div>
                </div>
              )}

              {/* SECTION: IMPACT */}
              {activeSection === 'IMPACT' && (
                <div className="space-y-12">
                   <div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 border-b border-slate-100 pb-4">ODS al que su labor investigativa aplica</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {ODS_LIST.map(ods => (
                            <button
                              key={ods}
                              type="button"
                              onClick={() => toggleItem(selectedODS, setSelectedODS, ods)}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border text-left transition-all",
                                selectedODS.includes(ods) ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-slate-50 text-slate-500 hover:border-slate-200"
                              )}
                            >
                               <div className={cn("h-5 w-5 rounded-md border flex items-center justify-center transition-colors", selectedODS.includes(ods) ? "bg-primary border-primary text-white" : "border-slate-200")}>
                                  {selectedODS.includes(ods) && <Check className="h-3 w-3" />}
                               </div>
                               <span className="text-xs font-medium">{ods}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8 border-b border-slate-100 pb-4">Línea de investigación institucional a la que aporta</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {researchLines.map(line => (
                            <button
                              key={line._id}
                              type="button"
                              onClick={() => toggleItem(selectedLines, setSelectedLines, line._id)}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border text-left transition-all",
                                selectedLines.includes(line._id) ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-slate-50 text-slate-500 hover:border-slate-200"
                              )}
                            >
                               <span className="text-[10px] font-bold whitespace-nowrap overflow-hidden text-ellipsis uppercase tracking-tighter">{line.name}</span>
                            </button>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {/* SECTION: RESEARCH */}
              {activeSection === 'RESEARCH' && (
                <div className="space-y-12">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Categoría Actual MINCIENCIAS</label>
                        <select value={mincienciasCategory} onChange={(e) => setMincienciasCategory(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-xs">
                           <option value="Investigador Junior (IJ)">Investigador Junior (IJ)</option>
                           <option value="Investigador Asociado (IA)">Investigador Asociado (IA)</option>
                           <option value="Investigador Senior (IS)">Investigador Senior (IS)</option>
                           <option value="Investigador Emérito (IE)">Investigador Emérito (IE)</option>
                           <option value="No Categorizado">No Categorizado (Integrante)</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Enlace Perfil CVLAC</label>
                        <div className="relative">
                           < Globe2 className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                           <input type="url" value={cvlacUrl} onChange={(e) => setCvlacUrl(e.target.value)} placeholder="https://scienti.minciencias.gov.co/cvlac/..." className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium" />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <div className="flex justify-between items-center ml-1">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Áreas de Investigación (Separadas por Coma)</label>
                           <span className={cn(
                              "text-[9px] font-bold tracking-widest uppercase",
                              areasInput.split(/[\s,]+/).filter(Boolean).length > 10 ? "text-rose-500" : "text-slate-300"
                           )}>
                              {areasInput.split(/[\s,]+/).filter(Boolean).length} / 10 Palabras
                           </span>
                        </div>
                        <input 
                          type="text" 
                          value={areasInput}
                          onChange={(e) => setAreasInput(e.target.value)}
                          placeholder="IA, Energías Renovables, Salud Pública..." 
                          className={cn(
                             "w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none font-medium text-xs",
                             areasInput.split(/[\s,]+/).filter(Boolean).length > 10 && "ring-2 ring-rose-500/20 border-rose-200"
                          )}
                        />
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <div className="flex justify-between items-center ml-1">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resumen de Biografía Profesional</label>
                           <span className={cn(
                              "text-[9px] font-bold tracking-widest uppercase",
                              biography.length > 1500 ? "text-rose-500" : "text-slate-300"
                           )}>
                              {biography.length} / 1600
                           </span>
                        </div>
                        <textarea 
                          value={biography} 
                          onChange={(e) => setBiography(e.target.value)} 
                          rows={5} 
                          maxLength={1600}
                          className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-xs font-medium resize-none leading-relaxed" 
                        />
                      </div>

                      {/* REDES SOCIALES */}
                      <div className="md:col-span-2 space-y-8 pt-8 border-t border-slate-100">
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Redes Académicas y Científicas</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <div className="flex items-center gap-2 text-primary">
                                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center font-bold text-[10px]">ORCID</div>
                                  <span className="text-[10px] font-bold uppercase">Perfil ORCID (URL)</span>
                               </div>
                               <input 
                                 type="url" 
                                 value={orcidUrl} 
                                 onChange={(e) => setOrcidUrl(e.target.value)} 
                                 placeholder="https://orcid.org/0000-..." 
                                 className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl outline-none text-xs font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all" 
                               />
                            </div>

                            <div className="space-y-4">
                               <div className="flex items-center gap-2 text-sky-600">
                                  <div className="h-6 w-6 rounded bg-sky-100 flex items-center justify-center">
                                     <Globe className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="text-[10px] font-bold uppercase">Google Scholar (URL)</span>
                               </div>
                               <input 
                                 type="url" 
                                 value={googleScholarUrl} 
                                 onChange={(e) => setGoogleScholarUrl(e.target.value)} 
                                 placeholder="https://scholar.google.com/citations?user=..." 
                                 className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl outline-none text-xs font-medium focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all" 
                               />
                            </div>
                         </div>
                      </div>

                      {/* GRUPOS DE INVESTIGACIÓN */}
                      <div className="md:col-span-2 pt-8 border-t border-slate-100">
                         <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Grupos de Investigación</h4>
                            <div className="relative w-48">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                               <input 
                                 type="text" 
                                 value={groupSearch}
                                 onChange={(e) => setGroupSearch(e.target.value)}
                                 placeholder="Filtrar grupos..." 
                                 className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl outline-none text-[10px] font-medium" 
                               />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-3 custom-scrollbar">
                            {filteredGroups.map(group => (
                               <button
                                 key={group._id}
                                 type="button"
                                 onClick={() => toggleItem(selectedGroups, setSelectedGroups, group._id)}
                                 className={cn(
                                   "flex items-center justify-between p-4 rounded-2xl border text-left transition-all",
                                   selectedGroups.includes(group._id) ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-50 text-slate-500 hover:border-slate-100"
                                 )}
                               >
                                  <span className="text-[9px] font-bold leading-tight uppercase max-w-[80%]">{group.name}</span>
                                  {selectedGroups.includes(group._id) && <Check className="h-3 w-3" />}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}
