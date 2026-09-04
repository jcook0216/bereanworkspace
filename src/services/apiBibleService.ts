import { TranslationId, Verse } from '../types';
import { getVersesForChapter } from '../data/scriptureDataset';

export interface ApiBibleStatus {
  configured: boolean;
  provider: string;
  supportedTranslations: string[];
}

export interface ChapterFetchResult {
  verses: Verse[];
  isLiveApi: boolean;
  errorNotice?: string;
}

// In-memory client cache
const clientCache = new Map<string, Verse[]>();

let cachedStatus: ApiBibleStatus | null = null;

export async function getApiBibleStatus(): Promise<ApiBibleStatus> {
  if (cachedStatus) return cachedStatus;
  try {
    const res = await fetch('/api/bible/status');
    if (res.ok) {
      const data = await res.json();
      cachedStatus = {
        configured: Boolean(data.configured),
        provider: data.provider || 'API.Bible',
        supportedTranslations: data.supportedTranslations || ['ASV', 'KJV', 'WEB']
      };
      return cachedStatus;
    }
  } catch (err) {
    console.warn('Could not query /api/bible/status:', err);
  }
  return { configured: false, provider: 'API.Bible', supportedTranslations: [] };
}

export async function fetchChapterVerses(
  book: string,
  chapter: number,
  translation: TranslationId = 'ASV'
): Promise<ChapterFetchResult> {
  const cacheKey = `${translation}_${book}_${chapter}`;
  if (clientCache.has(cacheKey)) {
    return {
      verses: clientCache.get(cacheKey)!,
      isLiveApi: true
    };
  }

  try {
    const res = await fetch(
      `/api/bible/chapter?book=${encodeURIComponent(book)}&chapter=${chapter}&translation=${translation}`
    );

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.verses) && data.verses.length > 0) {
        const transformed: Verse[] = data.verses.map((v: { verse: number; text: string; heading?: string }) => ({
          id: `${translation}_${book}_${chapter}_${v.verse}`,
          translation,
          book,
          chapter,
          verse: v.verse,
          text: v.text,
          heading: v.heading,
          segments: [{ text: v.text }]
        }));

        clientCache.set(cacheKey, transformed);
        return {
          verses: transformed,
          isLiveApi: true
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch from /api/bible/chapter, falling back to local dataset:', err);
  }

  // Graceful fallback to local high-fidelity dataset
  const fallback = getVersesForChapter(book, chapter, translation);
  return {
    verses: fallback,
    isLiveApi: false
  };
}

export async function searchApiBible(
  query: string,
  translation: TranslationId = 'KJV'
): Promise<Array<{ id: string; reference: string; text: string }> | null> {
  try {
    const res = await fetch(
      `/api/bible/search?query=${encodeURIComponent(query)}&translation=${translation}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.verses)) {
        return data.verses;
      }
    }
  } catch (err) {
    console.warn('API.Bible search query failed:', err);
  }
  return null;
}
