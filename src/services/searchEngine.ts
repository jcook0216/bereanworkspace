import { Index } from 'flexsearch';
import { CURATED_VERSES } from '../data/scriptureDataset';
import { BIBLE_BOOKS, getBookByName } from '../data/bibleBooks';
import { STRONGS_LEXICON } from '../data/strongsLexicon';
import { Verse, StrongsEntry } from '../types';

export interface SearchResult {
  type: 'verse' | 'reference' | 'strongs' | 'book';
  title: string;
  subtitle: string;
  ref: string;
  book: string;
  chapter: number;
  verse?: number;
  snippet?: string;
  strongsData?: StrongsEntry;
}

class SearchEngine {
  private verseIndex: any = null;
  private versesMap: Map<string, Verse> = new Map();
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;

    try {
      this.verseIndex = new Index({
        tokenize: 'forward',
        resolution: 9
      });

      // Populate index with curated verses
      CURATED_VERSES.forEach((v) => {
        this.versesMap.set(v.id, v);
        const searchableText = `${v.book} ${v.chapter}:${v.verse} ${v.text} ${v.heading || ''}`;
        this.verseIndex.add(v.id, searchableText);
      });

      this.isInitialized = true;
    } catch (e) {
      console.warn('FlexSearch initialization fallback to regex search', e);
    }
  }

  // Parses biblical references like "Gen 1:1", "John 3:16", "Romans 8:28", "Ps 23:1", "Heb 11", "Rev 22"
  parseReference(query: string): { book: string; chapter: number; verse?: number } | null {
    const trimmed = query.trim();
    if (!trimmed) return null;

    // Pattern: [Book Name] [Chapter]:[Verse] or [Book Name] [Chapter]
    const refRegex = /^(\d?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d+)(?::(\d+))?$/i;
    const match = trimmed.match(refRegex);

    if (match) {
      const bookPart = match[1].trim();
      const chapter = parseInt(match[2], 10);
      const verse = match[3] ? parseInt(match[3], 10) : undefined;

      const book = getBookByName(bookPart);
      if (book && chapter <= book.chaptersCount) {
        return {
          book: book.name,
          chapter,
          verse
        };
      }
    }

    // Direct book match check
    const singleBook = getBookByName(trimmed);
    if (singleBook) {
      return {
        book: singleBook.name,
        chapter: 1,
        verse: 1
      };
    }

    return null;
  }

  search(query: string, maxResults = 15): SearchResult[] {
    this.init();
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    const results: SearchResult[] = [];

    // 1. Check for Reference Match (e.g. "Gen 1:1" or "John 3")
    const refMatch = this.parseReference(cleanQuery);
    if (refMatch) {
      results.push({
        type: 'reference',
        title: `${refMatch.book} ${refMatch.chapter}${refMatch.verse ? `:${refMatch.verse}` : ''}`,
        subtitle: `Jump directly to Scripture text in ${refMatch.book}`,
        ref: `${refMatch.book} ${refMatch.chapter}:${refMatch.verse || 1}`,
        book: refMatch.book,
        chapter: refMatch.chapter,
        verse: refMatch.verse || 1
      });
    }

    // 2. Check for Strong's Number Match (e.g. "H7225" or "G3056" or "Logos" or "Bara")
    const strongsKey = cleanQuery.toUpperCase();
    if (STRONGS_LEXICON[strongsKey]) {
      const s = STRONGS_LEXICON[strongsKey];
      results.push({
        type: 'strongs',
        title: `${s.number}: ${s.lemma} (${s.transliteration})`,
        subtitle: `${s.partOfSpeech} — ${s.definition}`,
        ref: s.number,
        book: 'Genesis',
        chapter: 1,
        verse: 1,
        strongsData: s
      });
    }

    // Search Strong's definitions / lemmas
    Object.values(STRONGS_LEXICON).forEach((s) => {
      if (
        (s.lemma.includes(cleanQuery) ||
         s.transliteration.toLowerCase().includes(cleanQuery.toLowerCase()) ||
         s.definition.toLowerCase().includes(cleanQuery.toLowerCase())) &&
        s.number !== strongsKey
      ) {
        results.push({
          type: 'strongs',
          title: `${s.number}: ${s.lemma} (${s.transliteration})`,
          subtitle: `${s.partOfSpeech} — ${s.definition}`,
          ref: s.number,
          book: 'Genesis',
          chapter: 1,
          verse: 1,
          strongsData: s
        });
      }
    });

    // 3. Search book names
    BIBLE_BOOKS.forEach((b) => {
      if (b.name.toLowerCase().includes(cleanQuery.toLowerCase()) || b.shortName.toLowerCase().includes(cleanQuery.toLowerCase())) {
        if (!results.some(r => r.type === 'book' && r.book === b.name)) {
          results.push({
            type: 'book',
            title: b.name,
            subtitle: `${b.testament === 'OT' ? 'Old Testament' : 'New Testament'} • ${b.chaptersCount} Chapters • ${b.category}`,
            ref: `${b.name} 1:1`,
            book: b.name,
            chapter: 1,
            verse: 1
          });
        }
      }
    });

    // 4. FlexSearch Full Text Search across verses
    if (this.verseIndex) {
      try {
        const matches: any[] = this.verseIndex.search(cleanQuery, { limit: maxResults });
        matches.forEach((id) => {
          const v = this.versesMap.get(id);
          if (v && !results.some(r => r.ref === `${v.book} ${v.chapter}:${v.verse}`)) {
            results.push({
              type: 'verse',
              title: `${v.book} ${v.chapter}:${v.verse} (${v.translation})`,
              subtitle: v.text,
              ref: `${v.book} ${v.chapter}:${v.verse}`,
              book: v.book,
              chapter: v.chapter,
              verse: v.verse,
              snippet: v.text
            });
          }
        });
      } catch (e) {
        console.warn('FlexSearch index error, falling back', e);
      }
    }

    // Fallback search across curated verses if FlexSearch missed or has few results
    if (results.length < 5) {
      const qLower = cleanQuery.toLowerCase();
      CURATED_VERSES.forEach((v) => {
        if (v.text.toLowerCase().includes(qLower) && !results.some(r => r.ref === `${v.book} ${v.chapter}:${v.verse}`)) {
          results.push({
            type: 'verse',
            title: `${v.book} ${v.chapter}:${v.verse} (${v.translation})`,
            subtitle: v.text,
            ref: `${v.book} ${v.chapter}:${v.verse}`,
            book: v.book,
            chapter: v.chapter,
            verse: v.verse,
            snippet: v.text
          });
        }
      });
    }

    return results.slice(0, maxResults);
  }
}

export const searchEngine = new SearchEngine();
