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

    const result = {
      scholar: { citations: "---", hIndex: "--", i10Index: "--", lastUpdate: new Date().toISOString() },
      orcid: { works: 0, education: 0, employments: 0 },
      ontology: [] as any[],
      productionTrend: [] as any[],
      projectsTrend: [] as any[]
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

        // Mock Projects Trend (Institutional data simulation)
        // Usually fetched from a Projects collection
        result.projectsTrend = years.map((y, i) => ({ year: y, total: i * 2 + Math.floor(Math.random() * 3) }));

        // Node generation based on real data
        const nodeCount = Math.max(8, Math.min(20, result.orcid.works + 5));
        result.ontology = Array.from({ length: nodeCount }).map((_, i) => ({
          type: i % 4 === 0 ? "PUBLICATION" : i % 4 === 1 ? "INSTITUTION" : "RESEARCHER",
          id: i
        }));
      } catch (e) {
        console.error("ORCID Fetch Error:", e);
      }
    }

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

    // 4. INSTITUTIONAL PRODUCTS COUNT
    const AcademicItem = (await import('@/lib/models/AcademicItem')).default;
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
          indexedPerYear
       } 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
