export type Testament = 'OT' | 'NT';

export type TranslationId = 'NASB' | 'ASV' | 'NKJV' | 'NLT' | 'KJV' | 'WEB';

export interface BibleBook {
  id: string;
  name: string;
  shortName: string;
  testament: Testament;
  chaptersCount: number;
  category: 'Law' | 'History' | 'Poetry & Wisdom' | 'Major Prophets' | 'Minor Prophets' | 'Gospels' | 'Acts' | 'Epistles' | 'Revelation';
}

export interface VerseSegment {
  text: string;
  isItalic?: boolean;
  isRedLetter?: boolean;
  strongs?: string; // e.g. "H7225" or "G3056"
  isPoeticBreak?: boolean;
}

export interface Verse {
  id: string; // e.g. "NASB_Genesis_1_1"
  translation: TranslationId;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  segments: VerseSegment[];
  isPoetry?: boolean;
  heading?: string;
}

export type CommentarySourceName = 'gill' | 'henry' | 'jfb';

export interface CommentaryEntry {
  id: string;
  sourceName: CommentarySourceName;
  sourceTitle: string;
  book: string;
  chapter: number;
  verse: number;
  contentHtml: string;
  author: string;
  era: string;
}

export interface StrongsEntry {
  number: string; // e.g. "H7225", "G3056"
  lemma: string; // e.g. בְּרֵאשִׁית or λόγος
  transliteration: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  kjvTranslation: string;
  derivation: string;
  occurrences: number;
}

export interface TskReference {
  ref: string; // e.g. "John 1:1"
  previewText: string;
  theme?: string;
}

export interface CrossReferenceMap {
  verseRef: string; // "Genesis 1:1"
  references: TskReference[];
}

export interface UserVerseData {
  id: string;
  verseRef: string;
  noteContent: string;
  colorHighlight: string | null;
  timestamp: number;
  tags: string[];
}

export type StudyTab = 'commentary' | 'strongs' | 'crossref' | 'notes';
export type CommentarySourceFilter = 'gill' | 'henry' | 'jfb' | 'all';
