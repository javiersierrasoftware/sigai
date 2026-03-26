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
 * Other product base points placeholders (to be expanded as requested)
 */
export const DECRETO_1279_MAP = {
  TITULO_DOCTORADO: 80,
  TITULO_MAESTRIA: 40,
  TITULO_ESPECIALIZACION: 15,
  LIBRO_INVESTIGACION: 20,
  CAPITULO_LIBRO: 10,
  PONENCIA_INTERNACIONAL: 3,
  PONENCIA_NACIONAL: 1
}
