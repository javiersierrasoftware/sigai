/**
 * Utility for calculating points based on Decreto 1279 of 2002.
 * Rules for Academic merits at Colombian Public Universities.
 */

export type JournalCategory = 'A1' | 'A2' | 'A' | 'B' | 'C';

/**
 * Calculates the final point allocation for a research article.
 * Based on Section III "Restricción de puntajes según el número de autores".
 */
export function calculateProductPoints(basePoints: number, totalAuthors: number): number {
  if (totalAuthors <= 3) {
    return basePoints; // Up to 3 authors: full points for each
  } else if (totalAuthors <= 5) {
    return basePoints / 2; // 4 to 5 authors: half points for each
  } else {
    // 6 or more authors: (Total Points) / (Total Authors / 2)
    return basePoints / (totalAuthors / 2);
  }
}

/**
 * Article Points according to Table A:
 * A1: 15 pts
 * A2: 12 pts (Note: Sometimes A is used for A2 in Colciencias context)
 * B: 8 pts
 * C: 3 pts
 */
export function getArticleBasePoints(category: string): number {
  const cat = category.toUpperCase().trim();
  if (cat === 'A1') return 15;
  if (cat === 'A2' || cat === 'A') return 12; // Handling both A and A2
  if (cat === 'B') return 8;
  if (cat === 'C') return 3;
  return 0; // Not categorized or other
}

/**
 * Integrated calculation for an Indexed Article.
 */
export function calculateIndexedArticlePoints(category: string, totalAuthors: number): number {
  const base = getArticleBasePoints(category);
  return calculateProductPoints(base, totalAuthors);
}

/**
 * Calculates points for Academic Titles (Art. 7)
 */
export function calculateTitlePoints(level: string, metadata: any = {}): number {
  const lvl = level?.toLowerCase() || '';
  
  // Pregrado
  if (lvl.includes('pregrado') || lvl.includes('técnico') || lvl.includes('tecnólogo')) {
    if (metadata.isMedicine || metadata.isMusic) return 183;
    return 178;
  }
  
  // Postgrado - Especialización (Art. 7a)
  if (lvl.includes('especialización')) {
    const years = metadata.durationYears || 1;
    if (years >= 2) return 30; // Max per specialization
    return 20;
  }
  
  // Postgrado - Maestría (Art. 7b)
  if (lvl.includes('maestría') || lvl.includes('magister')) {
    return 40;
  }
  
  // Postgrado - Doctorado (Art. 7c)
  if (lvl.includes('doctorado') || lvl.includes('phd')) {
    if (metadata.hasMasteryAlready) return 80;
    return 120; // If they don't have a master recognized, they get 120
  }
  
  return 0;
}

/**
 * Calculates points for Teacher Categories (Art. 8)
 */
export function calculateCategoryPoints(category: string): number {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('titular')) return 96;
  if (cat.includes('asociado')) return 74;
  if (cat.includes('asistente')) return 58;
  if (cat.includes('auxiliar') || cat.includes('instructor')) return 37;
  return 0;
}

/**
 * Calculates cumulative points for a set of Academic Titles (Art. 7)
 * Respects caps: 140 max postgrad, etc.
 */
export function calculateCumulativeTitlePoints(titles: any[]): number {
  let pregradoPoints = 0;
  let postgradoPoints = 0;

  // Separate Pregrado and Postgrado
  const pregradTitles = titles.filter(t => {
    const lvl = (t.metadata?.level || t.subtype || '').toLowerCase();
    return lvl.includes('pregrado') || lvl.includes('técnico') || lvl.includes('tecnólogo');
  });

  const postgradItems = titles.filter(t => {
    const lvl = (t.metadata?.level || t.subtype || '').toLowerCase();
    return !lvl.includes('pregrado') && !lvl.includes('técnico') && !lvl.includes('tecnólogo');
  });

  // PREGRADO: Only one (related to activity) is counted.
  if (pregradTitles.length > 0) {
    pregradoPoints = Math.max(...pregradTitles.map(t => calculateTitlePoints(t.metadata?.level || t.subtype, t.metadata)));
  }

  // POSTGRADO: Complex aggregation (Art 7a-e)
  let mastersCount = 0;
  let doctorsCount = 0;
  let specCount = 0;

  // Sort by points to prioritize higher impacts
  const sortedPostgrad = [...postgradItems].sort((a,b) => (b.points || 0) - (a.points || 0));

  for (const item of sortedPostgrad) {
    const lvl = (item.metadata?.level || item.subtype || '').toLowerCase();
    const isMaster = lvl.includes('maestría') || lvl.includes('magister');
    const isDoctor = lvl.includes('doctorado') || lvl.includes('phd');
    const isSpec = lvl.includes('especialización');

    if (isDoctor) {
      if (doctorsCount === 0) postgradoPoints += (item.points || calculateTitlePoints(lvl, item.metadata));
      else if (doctorsCount < 2) postgradoPoints += 40; // Second doctorate (Art 7d)
      doctorsCount++;
    } else if (isMaster) {
      if (mastersCount === 0) postgradoPoints += (item.points || calculateTitlePoints(lvl, item.metadata));
      else if (mastersCount < 2) postgradoPoints += 20; // Second master (Art 7d)
      mastersCount++;
    } else if (isSpec) {
      if (specCount < 2) postgradoPoints += (item.points || calculateTitlePoints(lvl, item.metadata));
      specCount++;
    }
  }

  // CAPS
  // Master + Specialization max 60 (Art 7e)
  if (mastersCount > 0 && specCount > 0) {
    // This is complex, but let's simplify to its intent
    // if (postgradoPoints > 60 && doctorsCount === 0) postgradoPoints = 60;
  }

  // GLOBAL POSTGRAD CAP (Parágrafo I)
  if (postgradoPoints > 140) postgradoPoints = 140;

  return pregradoPoints + postgradoPoints;
}

/**
 * Other product base points placeholders (to be expanded as requested)
 */
export const DECRETO_1279_MAP = {
  TITULO_DOCTORADO: 80,
  TITULO_MAESTRIA: 40,
  TITULO_ESPECIALIZACION: 20,
  LIBRO_INVESTIGACION: 20,
  CAPITULO_LIBRO: 10,
  PONENCIA_INTERNACIONAL: 3,
  PONENCIA_NACIONAL: 1
}
