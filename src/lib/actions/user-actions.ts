'use server'

import connectDB from '@/lib/mongoose';
import User from '@/lib/models/User';
import { getSession } from './auth-actions';
import { revalidatePath } from 'next/cache';

export async function getUserProfile() {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');
    
    await connectDB();
    const user = await User.findById(session.user.id)
      .populate('profile.faculty')
      .populate('profile.program')
      .populate('profile.researchLines')
      .populate('profile.researchGroups');
      
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    
    // Basic Info
    const fullName = formData.get('fullName') as string;
    
    // Profile Fields
    const profileData: any = {
      profilePicture: formData.get('profilePicture') as string || undefined,
      birthDate: formData.get('birthDate') as string,
      gender: formData.get('gender') as string,
      differentialFocus: formData.get('differentialFocus') as string,
      hasDisability: formData.get('hasDisability') === 'true',
      disabilityType: formData.get('disabilityType') as string,
      faculty: formData.get('faculty') || undefined,
      program: formData.get('program') || undefined,
      joiningMonth: formData.get('joiningMonth') as string,
      joiningYear: formData.get('joiningYear') as string,
      contractType: formData.get('contractType') as string,
      
      // JSON strings for arrays
      ods: JSON.parse(formData.get('ods') as string || '[]'),
      researchLines: JSON.parse(formData.get('researchLines') as string || '[]'),
      researchGroups: JSON.parse(formData.get('researchGroups') as string || '[]'),
      researchAreas: JSON.parse(formData.get('researchAreas') as string || '[]'),
      
      mincienciasCategory: formData.get('mincienciasCategory') as string,
      cvlacUrl: formData.get('cvlacUrl') as string,
      biography: formData.get('biography') as string,
      orcidId: formData.get('orcidId') as string,
      orcidUrl: formData.get('orcidUrl') as string,
      googleScholarUrl: formData.get('googleScholarUrl') as string,
    };

    const user = await User.findByIdAndUpdate(session.user.id, {
      fullName,
      profile: profileData
    }, { new: true });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');
    
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches real metrics from ORCID and Google Scholar URLs
 */
export async function fetchResearcherMetrics() {
  try {
    const session = await getSession();
    if (!session) throw new Error('No autorizado');

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user || !user.profile) throw new Error('Perfil no encontrado');

    const AcademicItem = (await import('@/lib/models/AcademicItem')).default;
    const Project = (await import('@/lib/models/Project')).default;
    const ProjectEvaluation = (await import('@/lib/models/ProjectEvaluation')).default;

    const result = {
      scholar: { citations: "---", hIndex: "--", i10Index: "--", lastUpdate: new Date().toISOString() },
      orcid: { works: 0, education: 0, employments: 0 },
      ontology: null as any,
      productionTrend: [] as any[],
      projectsTrend: [] as any[],
      keywordsCloud: [] as any[]
    };

    // Initialize trends for last 5 years
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
    result.productionTrend = years.map(y => ({ year: y, articles: 0, chapters: 0, others: 0 }));
    result.projectsTrend = years.map(y => ({ year: y, total: 0 }));

    // 1. EXTRACT AND FETCH ORCID
    const orcidUrl = user.profile.orcidUrl || "";
    const orcidIdMatch = orcidUrl.match(/0000-000[1-3]-\d{4}-\d{3}[\dX]/);
    const orcidId = orcidIdMatch ? orcidIdMatch[0] : null;

    const personId = orcidId ? `https://orcid.org/${orcidId}` : `user:${session.user.id}`;
    result.ontology = {
       persons: [
          { id: personId, type: "Person", name: user.fullName, isPrincipal: true }
       ],
       works: [] as any[],
       organizations: [
          { id: "org:unisucre", type: "Organization", name: "Universidad de Sucre" },
          ...(user.profile?.researchGroups || []).map((g: any) => ({
             id: `group:${g._id || Math.random()}`,
             type: "Organization",
             name: g.name || "Grupo de Investigación"
          }))
       ],
       concepts: (user.profile?.researchLines || []).map((l: any) => ({
          id: `line:${l._id || Math.random()}`,
          type: "Concept",
          name: typeof l === 'string' ? l : (l.name || "Línea de Investigación")
       })),
       relations: [] as any[]
    };

    if (orcidId) {
      try {
        const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}/record`, {
          headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        
        const works = data['activities-summary']?.['works']?.group || [];
        result.orcid = {
          works: works.length,
          education: data['activities-summary']?.['educations']?.['education-summary']?.length || 0,
          employments: data['activities-summary']?.['employments']?.['affiliation-group']?.length || 0,
        };

        // Add ORCID works to ontology
        works.slice(0, 8).forEach((w: any) => {
           result.ontology.works.push({
              id: w['work-summary']?.[0]?.['external-ids']?.['external-id']?.[0]?.['external-id-value'] || `work:${Math.random()}`,
              type: "Work",
              title: w['work-summary']?.[0]?.title?.title?.value || "Sin título"
           });
        });

        // Create relations
        result.ontology.works.forEach((w: any) => {
           result.ontology.relations.push({ from: personId, to: w.id, type: "AUTHORED" });
        });
        result.ontology.organizations.forEach((org: any) => {
           result.ontology.relations.push({ from: personId, to: org.id, type: "AFFILIATED_WITH" });
        });

        // Aggregate production by year from ORCID
        works.forEach((w: any) => {
           const type = w['work-summary']?.[0]?.type?.toLowerCase() || "";
           const year = parseInt(w['work-summary']?.[0]?.['publication-date']?.year?.value);
           if (year && years.includes(year)) {
              const trendIdx = result.productionTrend.findIndex(t => t.year === year);
              if (trendIdx !== -1) {
                 if (type.includes('article')) result.productionTrend[trendIdx].articles++;
                 else if (type.includes('chapter')) result.productionTrend[trendIdx].chapters++;
                 else result.productionTrend[trendIdx].others++;
              }
           }
        });
      } catch (e) {
        console.error("ORCID Fetch Error:", e);
      }
    }

    // 1.5. Aggregate production from DATABASE (Internal SIGAI)
    const localItems = await AcademicItem.find({
       users: session.user.id,
       type: 'PRODUCCION'
    }).lean();

    localItems.forEach((item: any) => {
       const year = new Date(item.date).getFullYear();
       const workId = `db_work:${item._id}`;
       
       // Add to ontology works as well (Internal productions)
       if (result.ontology.works.length < 15) {
          result.ontology.works.push({
             id: workId,
             type: "Work",
             subtype: item.subtype,
             title: item.title || "Sin título"
          });
       }

       // Extract and Add Co-authors to ontology
       (item.authors || []).slice(0, 3).forEach((auth: any) => {
          const authId = auth.userId ? `user:${auth.userId}` : `external:${auth.name}`;
          if (!result.ontology.persons.find((p: any) => p.id === authId)) {
             result.ontology.persons.push({
                id: authId,
                type: "Person",
                name: auth.name,
                isPrincipal: false
             });
          }
          result.ontology.relations.push({ from: authId, to: workId, type: "AUTHORED" });
       });

       if (years.includes(year)) {
          const trendIdx = result.productionTrend.findIndex(t => t.year === year);
          if (trendIdx !== -1) {
             const st = (item.subtype || "").toLowerCase();
             if (st.includes('artículo') || st.includes('articulo')) result.productionTrend[trendIdx].articles++;
             else if (st.includes('capítulo') || st.includes('capitulo')) result.productionTrend[trendIdx].chapters++;
             else result.productionTrend[trendIdx].others++;
          }
       }
    });

    // 1.6. Aggregate PROJECTS from DATABASE (Internal SIGAI)
    const localProjects = await Project.find({
       $or: [{ leaderEmail: session.user.email }, { "teamMembers.email": session.user.email }]
    }).lean();

    localProjects.forEach((p: any) => {
       const year = new Date(p.startDate || p.createdAt).getFullYear();
       
       // Add to ontology as well (Projects as a type of work)
       if (result.ontology.works.length < 20) {
          result.ontology.works.push({
             id: `project:${p._id}`,
             type: "Work",
             subtype: "PROYECTO",
             title: p.title || "Proyecto de Investigación"
          });
       }

        if (years.includes(year)) {
          const trendIdx = result.projectsTrend.findIndex(t => t.year === year);
          if (trendIdx !== -1) {
             result.projectsTrend[trendIdx].total++;
          }
       }
    });

    // 1.7. Aggregate Keywords for Word Cloud
    const allItemsForKeywords = await AcademicItem.find({
       users: session.user.id,
       keywords: { $exists: true, $ne: [] }
    }).select('keywords type subtype').lean();

    const keywordCounts: Record<string, { count: number, types: Set<string> }> = {};
    allItemsForKeywords.forEach((item: any) => {
       (item.keywords || []).forEach((kw: string) => {
          const normalized = kw.trim();
          if (!normalized) return;
          if (!keywordCounts[normalized]) {
             keywordCounts[normalized] = { count: 0, types: new Set() };
          }
          keywordCounts[normalized].count++;
          keywordCounts[normalized].types.add(item.subtype || item.type);
       });
    });

    result.keywordsCloud = Object.entries(keywordCounts)
       .map(([text, data]) => ({
          text,
          value: data.count,
          categories: Array.from(data.types)
       }))
       .sort((a, b) => b.value - a.value)
       .slice(0, 40); // Top 40 keywords for the cloud

    // FINAL RE-GENERATION OF RELATIONS with ALL sources
    result.ontology.relations = []; // Clear and rebuild
    result.ontology.works.forEach((w: any) => {
       result.ontology.relations.push({ from: personId, to: w.id, type: "AUTHORED" });
    });
    result.ontology.organizations.forEach((org: any) => {
       result.ontology.relations.push({ from: personId, to: org.id, type: "AFFILIATED_WITH" });
    });
    result.ontology.concepts?.forEach((c: any) => {
       result.ontology.relations.push({ from: personId, to: c.id, type: "INTERESTED_IN" });
    });

    // 2. GOOGLE SCHOLAR REAL FETCH (HTML Parsing)
    if (user.profile.googleScholarUrl) {
      try {
        const response = await fetch(user.profile.googleScholarUrl, {
           headers: {
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
           }
        });
        const html = await response.text();
        
        // Extract metrics using specific table class gsc_rsb_std
        const metricsMatch = html.match(/class="gsc_rsb_std">(\d+)<\/td>/g);
        if (metricsMatch && metricsMatch.length >= 3) {
          result.scholar = {
            citations: metricsMatch[0].replace(/[^0-9]/g, ''),
            hIndex: metricsMatch[2].replace(/[^0-9]/g, ''),
            i10Index: metricsMatch[4].replace(/[^0-9]/g, ''),
            lastUpdate: new Date().toISOString()
          };
        }
      } catch (e) {
        console.error("Scholar Fetch Error:", e);
      }
    }

    // 3. PROFILE STATS (Characterization)
    const profile = user.profile || {};
    const birthDate = profile.birthDate ? new Date(profile.birthDate) : null;
    
    // Exact seniority calculation from day 1 of the month
    const monthMap: Record<string, number> = {
      "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4, "Mayo": 5, "Junio": 6,
      "Julio": 7, "Agosto": 8, "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12
    };

    const joiningYear = parseInt(profile.joiningYear || "");
    const joiningMonthStr = profile.joiningMonth || "Enero";
    const monthNum = monthMap[joiningMonthStr] || 1;
    
    const joiningDate = joiningYear ? new Date(joiningYear, monthNum - 1, 1) : null;
    
    const now = new Date();
    const age = birthDate ? Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 0;
    const seniority = joiningDate ? Math.floor((now.getTime() - joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 0;

    const profileStats = {
       mincienciasCategory: profile.mincienciasCategory || "Sin Categoría",
       age: { value: age, label: "Años de edad" },
       seniority: { value: seniority, label: "Años en la institución" },
       odsCount: { value: profile.ods?.length || 0, label: "ODS Impactados", max: 17 },
       linesCount: { value: profile.researchLines?.length || 0, label: "Líneas de Investigación" },
       groupsCount: { value: profile.researchGroups?.length || 0, label: "Grupos de Investigación" }
    };

    const evaluationsCount = await ProjectEvaluation.countDocuments({ 
       evaluatorEmail: session.user.email,
       status: 'PENDING'
    });
    
    // Personal Active Projects (Approved or In Execution)
    const activeProjectsCount = await Project.countDocuments({
       $or: [{ leaderEmail: session.user.email }, { "teamMembers.email": session.user.email }],
       status: { $in: ['APPROVED', 'IN_EXECUTION'] }
    });

    // Total Institutional Stats for ADMIN/ADMINDIUS
    let institutionalStats = null;
    if (session.user.role === 'ADMIN' || session.user.role === 'ADMINDIUS') {
       const [totalActiveProjects, totalResearchers, totalInstitutionalProducts, totalTitulos] = await Promise.all([
          Project.countDocuments({ status: { $in: ['APPROVED', 'IN_EXECUTION'] } }),
          User.countDocuments({ role: 'DOCENTE' }),
          AcademicItem.countDocuments({ type: 'PRODUCCION' }),
          AcademicItem.countDocuments({ type: 'TITULO' })
       ]);
       institutionalStats = {
          projects: totalActiveProjects,
          researchers: totalResearchers,
          products: totalInstitutionalProducts,
          titulos: totalTitulos
       };
    }

    const totalProducts = await AcademicItem.countDocuments({ 
       users: session.user.id, 
       type: 'PRODUCCION' 
    });

    // 5. PERFORMANCE INDICATORS
    const productsPerYear = seniority > 0 ? (totalProducts / seniority).toFixed(1) : totalProducts.toString();

    const indexedArticlesCount = await AcademicItem.countDocuments({
       users: session.user.id,
       type: 'PRODUCCION',
       subtype: /artículo|articulo/i
    });
    const indexedPerYear = seniority > 0 ? (indexedArticlesCount / seniority).toFixed(1) : indexedArticlesCount.toString();

    // 6. RECENT PROJECTS FOR DASHBOARD
    const filter = (session.user.role === 'ADMIN' || session.user.role === 'ADMINDIUS') 
       ? {} 
       : { $or: [{ leaderEmail: session.user.email }, { "teamMembers.email": session.user.email }] };
       
    const recentProjects = await Project.find(filter)
       .sort({ updatedAt: -1 })
       .limit(4)
       .lean();

    return { 
       success: true, 
       data: {
          ...result,
          links: {
             scholar: user.profile.googleScholarUrl,
             orcid: user.profile.orcidUrl
          },
           profileStats,
           totalProducts,
           productsPerYear,
           indexedPerYear,
           institutionalStats,
           evaluationsCount,
           activeProjectsCount,
           recentProjects: JSON.parse(JSON.stringify(recentProjects))
        } 
     };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
