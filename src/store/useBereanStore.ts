import { create } from 'zustand';
import { TranslationId, StudyTab, CommentarySourceFilter, StrongsEntry, TskReference, UserVerseData } from '../types';
import { BIBLE_BOOKS } from '../data/bibleBooks';
import { STRONGS_LEXICON } from '../data/strongsLexicon';
import { getTskForVerse } from '../data/tskCrossReferences';
import { localDB, CloudSyncConfig, syncWithSupabase } from '../services/db';

interface BereanStoreState {
  // Navigation & Scripture
  currentBook: string;
  currentChapter: number;
  activeVerse: number;
  primaryTranslation: TranslationId;
  parallelTranslation: TranslationId | null;
  isParallelMode: boolean;
  showStrongsNumbers: boolean;
  redLetterEnabled: boolean;
  fontSize: number;

  // Study Pane
  activeStudyTab: StudyTab;
  activeCommentarySource: CommentarySourceFilter;
  selectedStrongs: StrongsEntry | null;

  // Popups & Overlays
  commandPaletteOpen: boolean;
  shortcutsModalOpen: boolean;
  cloudSyncModalOpen: boolean;
  tskPopover: { verseRef: string; anchorRect?: { top: number; left: number; width: number; height: number }; targets: TskReference[] } | null;

  // User Data & Persistence
  userDataList: UserVerseData[];
  downloadedTranslations: TranslationId[];
  cloudSyncConfig: CloudSyncConfig;
  isSyncing: boolean;
  syncNotice: string | null;

  // Responsive Layout
  leftPaneOpen: boolean;
  rightPaneOpen: boolean;
  mobileActiveTab: 'scripture' | 'study' | 'nav' | 'notes';

  // Actions
  navigateTo: (book: string, chapter: number, verse?: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  setActiveVerse: (verse: number) => void;
  setPrimaryTranslation: (t: TranslationId) => void;
  setParallelTranslation: (t: TranslationId | null) => void;
  toggleParallelMode: () => void;
  toggleStrongsNumbers: () => void;
  toggleRedLetter: () => void;
  setFontSize: (size: number | ((prev: number) => number)) => void;
  setActiveStudyTab: (tab: StudyTab) => void;
  setActiveCommentarySource: (source: CommentarySourceFilter) => void;
  setSelectedStrongs: (entry: StrongsEntry | null) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setCloudSyncModalOpen: (open: boolean) => void;
  setTskPopover: (data: { verseRef: string; anchorRect?: { top: number; left: number; width: number; height: number }; targets: TskReference[] } | null) => void;
  
  // Highlighting & Notes
  setVerseHighlight: (verseRef: string, color: string | null) => Promise<void>;
  saveVerseNote: (verseRef: string, noteContent: string, tags?: string[]) => Promise<void>;
  deleteUserDataItem: (id: string) => Promise<void>;

  // Cloud & Local Sync
  initApp: () => Promise<void>;
  triggerSync: () => Promise<void>;
  updateCloudConfig: (cfg: Partial<CloudSyncConfig>) => Promise<void>;
  downloadTranslationModule: (id: TranslationId) => Promise<void>;

  // UI state
  setLeftPaneOpen: (open: boolean) => void;
  setRightPaneOpen: (open: boolean) => void;
  setMobileActiveTab: (tab: 'scripture' | 'study' | 'nav' | 'notes') => void;
}

export const useBereanStore = create<BereanStoreState>((set, get) => ({
  // Defaults
  currentBook: 'Genesis',
  currentChapter: 1,
  activeVerse: 1,
  primaryTranslation: 'NASB',
  parallelTranslation: 'ASV',
  isParallelMode: false,
  showStrongsNumbers: true,
  redLetterEnabled: true,
  fontSize: 18,

  activeStudyTab: 'commentary',
  activeCommentarySource: 'all',
  selectedStrongs: STRONGS_LEXICON['H7225'] || null,

  commandPaletteOpen: false,
  shortcutsModalOpen: false,
  cloudSyncModalOpen: false,
  tskPopover: null,

  userDataList: [],
  downloadedTranslations: ['NASB', 'ASV', 'NKJV', 'NLT'],
  cloudSyncConfig: {
    enabled: false,
    supabaseUrl: '',
    supabaseKey: '',
    status: 'idle',
    lastSynced: null
  },
  isSyncing: false,
  syncNotice: null,

  leftPaneOpen: true,
  rightPaneOpen: true,
  mobileActiveTab: 'scripture',

  navigateTo: (book: string, chapter: number, verse: number = 1) => {
    const bookObj = BIBLE_BOOKS.find(b => b.name.toLowerCase() === book.toLowerCase());
    const validBook = bookObj ? bookObj.name : 'Genesis';
    const validChapter = Math.max(1, Math.min(chapter, bookObj ? bookObj.chaptersCount : 50));
    
    set({
      currentBook: validBook,
      currentChapter: validChapter,
      activeVerse: verse,
      tskPopover: null,
      mobileActiveTab: 'scripture'
    });
  },

  nextChapter: () => {
    const { currentBook, currentChapter } = get();
    const bookIndex = BIBLE_BOOKS.findIndex(b => b.name.toLowerCase() === currentBook.toLowerCase());
    if (bookIndex === -1) return;

    const currentBookObj = BIBLE_BOOKS[bookIndex];
    if (currentChapter < currentBookObj.chaptersCount) {
      set({ currentChapter: currentChapter + 1, activeVerse: 1, tskPopover: null });
    } else if (bookIndex < BIBLE_BOOKS.length - 1) {
      const nextBookObj = BIBLE_BOOKS[bookIndex + 1];
      set({ currentBook: nextBookObj.name, currentChapter: 1, activeVerse: 1, tskPopover: null });
    }
  },

  prevChapter: () => {
    const { currentBook, currentChapter } = get();
    const bookIndex = BIBLE_BOOKS.findIndex(b => b.name.toLowerCase() === currentBook.toLowerCase());
    if (bookIndex === -1) return;

    if (currentChapter > 1) {
      set({ currentChapter: currentChapter - 1, activeVerse: 1, tskPopover: null });
    } else if (bookIndex > 0) {
      const prevBookObj = BIBLE_BOOKS[bookIndex - 1];
      set({ currentBook: prevBookObj.name, currentChapter: prevBookObj.chaptersCount, activeVerse: 1, tskPopover: null });
    }
  },

  setActiveVerse: (verse: number) => {
    set({ activeVerse: verse });
  },

  setPrimaryTranslation: (t: TranslationId) => {
    set({ primaryTranslation: t });
  },

  setParallelTranslation: (t: TranslationId | null) => {
    set({ parallelTranslation: t });
  },

  toggleParallelMode: () => {
    set(state => ({ isParallelMode: !state.isParallelMode }));
  },

  toggleStrongsNumbers: () => {
    set(state => ({ showStrongsNumbers: !state.showStrongsNumbers }));
  },

  toggleRedLetter: () => {
    set(state => ({ redLetterEnabled: !state.redLetterEnabled }));
  },

  setFontSize: (sizeOrFn) => {
    set(state => {
      const newSize = typeof sizeOrFn === 'function' ? sizeOrFn(state.fontSize) : sizeOrFn;
      return { fontSize: Math.max(14, Math.min(26, newSize)) };
    });
  },

  setActiveStudyTab: (tab: StudyTab) => {
    set({ activeStudyTab: tab });
  },

  setActiveCommentarySource: (source: CommentarySourceFilter) => {
    set({ activeCommentarySource: source });
  },

  setSelectedStrongs: (entry: StrongsEntry | null) => {
    set({ selectedStrongs: entry, activeStudyTab: 'strongs' });
  },

  setCommandPaletteOpen: (open: boolean) => {
    set({ commandPaletteOpen: open });
  },

  setShortcutsModalOpen: (open: boolean) => {
    set({ shortcutsModalOpen: open });
  },

  setCloudSyncModalOpen: (open: boolean) => {
    set({ cloudSyncModalOpen: open });
  },

  setTskPopover: (data) => {
    set({ tskPopover: data });
  },

  // Highlighting
  setVerseHighlight: async (verseRef: string, color: string | null) => {
    const { userDataList } = get();
    const existing = userDataList.find(u => u.verseRef === verseRef);

    const updated: UserVerseData = existing
      ? { ...existing, colorHighlight: color, timestamp: Date.now() }
      : {
          id: `user_data_${verseRef.replace(/[^a-zA-Z0-9]/g, '_')}`,
          verseRef,
          noteContent: '',
          colorHighlight: color,
          timestamp: Date.now(),
          tags: []
        };

    // Save to IndexedDB
    await localDB.saveUserData(updated);

    const nextList = existing
      ? userDataList.map(u => (u.verseRef === verseRef ? updated : u))
      : [...userDataList, updated];

    set({ userDataList: nextList });
  },

  // Notes
  saveVerseNote: async (verseRef: string, noteContent: string, tags: string[] = []) => {
    const { userDataList } = get();
    const existing = userDataList.find(u => u.verseRef === verseRef);

    const updated: UserVerseData = existing
      ? { ...existing, noteContent, tags: tags.length ? tags : existing.tags, timestamp: Date.now() }
      : {
          id: `user_data_${verseRef.replace(/[^a-zA-Z0-9]/g, '_')}`,
          verseRef,
          noteContent,
          colorHighlight: null,
          timestamp: Date.now(),
          tags
        };

    await localDB.saveUserData(updated);

    const nextList = existing
      ? userDataList.map(u => (u.verseRef === verseRef ? updated : u))
      : [...userDataList, updated];

    set({ userDataList: nextList });
  },

  deleteUserDataItem: async (id: string) => {
    await localDB.deleteUserData(id);
    set(state => ({
      userDataList: state.userDataList.filter(u => u.id !== id)
    }));
  },

  initApp: async () => {
    try {
      // Load saved user data
      const items = await localDB.getAllUserData();
      // Load cloud config
      const savedConfig = await localDB.getSetting<CloudSyncConfig>('cloudSyncConfig', {
        enabled: false,
        supabaseUrl: '',
        supabaseKey: '',
        status: 'idle',
        lastSynced: null
      });

      set({
        userDataList: items,
        cloudSyncConfig: savedConfig
      });
    } catch (e) {
      console.warn('Failed to load initial IndexedDB data', e);
    }
  },

  triggerSync: async () => {
    const { cloudSyncConfig, userDataList } = get();
    set({
      isSyncing: true,
      cloudSyncConfig: { ...cloudSyncConfig, status: 'syncing' }
    });

    try {
      const res = await syncWithSupabase(cloudSyncConfig, userDataList);
      const now = Date.now();
      const nextConfig: CloudSyncConfig = {
        ...cloudSyncConfig,
        status: res.success ? 'synced' : 'error',
        lastSynced: res.success ? now : cloudSyncConfig.lastSynced,
        errorMessage: res.success ? undefined : res.message
      };

      await localDB.saveSetting('cloudSyncConfig', nextConfig);

      set({
        isSyncing: false,
        cloudSyncConfig: nextConfig,
        syncNotice: res.message
      });

      setTimeout(() => {
        set({ syncNotice: null });
      }, 4000);
    } catch (err: any) {
      set({
        isSyncing: false,
        cloudSyncConfig: { ...cloudSyncConfig, status: 'error', errorMessage: err.message },
        syncNotice: `Sync failed: ${err.message}`
      });
    }
  },

  updateCloudConfig: async (cfg: Partial<CloudSyncConfig>) => {
    const current = get().cloudSyncConfig;
    const next = { ...current, ...cfg };
    await localDB.saveSetting('cloudSyncConfig', next);
    set({ cloudSyncConfig: next });
  },

  downloadTranslationModule: async (id: TranslationId) => {
    const { downloadedTranslations } = get();
    if (downloadedTranslations.includes(id)) return;
    const next = [...downloadedTranslations, id];
    set({ downloadedTranslations: next });
    await localDB.saveSetting('downloadedTranslations', next);
  },

  setLeftPaneOpen: (open: boolean) => set({ leftPaneOpen: open }),
  setRightPaneOpen: (open: boolean) => set({ rightPaneOpen: open }),
  setMobileActiveTab: (tab) => set({ mobileActiveTab: tab })
}));
