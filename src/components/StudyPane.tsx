import React, { useState, useEffect } from 'react';
import { useBereanStore } from '../store/useBereanStore';
import { getCommentaryForVerse, COMMENTARY_METADATA } from '../data/commentariesDataset';
import { STRONGS_LEXICON } from '../data/strongsLexicon';
import { getTskForVerse } from '../data/tskCrossReferences';
import { StudyTab, CommentarySourceName, CommentarySourceFilter, StrongsEntry } from '../types';
import {
  BookOpen,
  Languages,
  GitFork,
  PenSquare,
  Sparkles,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Trash2,
  Tag,
  Save,
  ChevronDown
} from 'lucide-react';

export const StudyPane: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    activeVerse,
    activeStudyTab,
    setActiveStudyTab,
    activeCommentarySource,
    setActiveCommentarySource,
    selectedStrongs,
    setSelectedStrongs,
    navigateTo,
    userDataList,
    saveVerseNote,
    deleteUserDataItem,
    cloudSyncConfig,
    setCloudSyncModalOpen,
    triggerSync,
    isSyncing
  } = useBereanStore();

  const activeRefKey = `${currentBook} ${currentChapter}:${activeVerse}`;
  const currentUserData = userDataList.find(u => u.verseRef === activeRefKey);

  const [noteDraft, setNoteDraft] = useState(currentUserData?.noteContent || '');
  const [tagInput, setTagInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Study column font readability settings
  const [studyFontSize, setStudyFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('berean_study_font_size');
      return saved ? parseInt(saved, 10) : 15;
    } catch {
      return 15;
    }
  });

  const [studyFontFamily, setStudyFontFamily] = useState<'sans' | 'serif'>(() => {
    try {
      const saved = localStorage.getItem('berean_study_font_family');
      return saved === 'serif' ? 'serif' : 'sans';
    } catch {
      return 'sans';
    }
  });

  const changeStudyFontSize = (delta: number) => {
    setStudyFontSize(prev => {
      const next = Math.max(13, Math.min(24, prev + delta));
      try {
        localStorage.setItem('berean_study_font_size', next.toString());
      } catch {}
      return next;
    });
  };

  const toggleFontFamily = () => {
    setStudyFontFamily(prev => {
      const next = prev === 'sans' ? 'serif' : 'sans';
      try {
        localStorage.setItem('berean_study_font_family', next);
      } catch {}
      return next;
    });
  };

  // Sync draft when verse changes
  useEffect(() => {
    setNoteDraft(currentUserData?.noteContent || '');
  }, [activeRefKey, currentUserData]);

  // Keyboard shortcut 1-4 for commentary sources
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === '1') setActiveCommentarySource('gill');
      if (e.key === '2') setActiveCommentarySource('henry');
      if (e.key === '3') setActiveCommentarySource('jfb');
      if (e.key === '4') setActiveCommentarySource('all');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setActiveCommentarySource]);

  const handleSaveNote = async () => {
    const tags = tagInput.trim() ? tagInput.split(',').map(t => t.trim()).filter(Boolean) : (currentUserData?.tags || []);
    await saveVerseNote(activeRefKey, noteDraft, tags);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const tskRefs = getTskForVerse(currentBook, currentChapter, activeVerse);

  // Commentaries to show based on filter
  const commentarySourcesToShow: CommentarySourceName[] =
    activeCommentarySource === 'all'
      ? ['gill', 'henry', 'jfb']
      : [activeCommentarySource as CommentarySourceName];

  return (
    <div
      id="right-study-pane"
      className="h-full flex flex-col bg-[#0F0F12] border-l border-slate-800 select-text overflow-hidden text-slate-300"
    >
      {/* Top Study Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0F0F12] p-1.5 shrink-0">
        <div className="grid grid-cols-4 gap-1 w-full">
          <button
            onClick={() => setActiveStudyTab('commentary')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeStudyTab === 'commentary'
                ? 'bg-slate-800/90 text-amber-500 shadow-xs border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Exposition</span>
          </button>
          <button
            onClick={() => setActiveStudyTab('strongs')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeStudyTab === 'strongs'
                ? 'bg-slate-800/90 text-amber-500 shadow-xs border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-blue-400" />
            <span>Strong's</span>
          </button>
          <button
            onClick={() => setActiveStudyTab('crossref')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeStudyTab === 'crossref'
                ? 'bg-slate-800/90 text-amber-500 shadow-xs border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-purple-400" />
            <span>TSK Refs</span>
          </button>
          <button
            onClick={() => setActiveStudyTab('notes')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeStudyTab === 'notes'
                ? 'bg-slate-800/90 text-amber-500 shadow-xs border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <PenSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Notebook</span>
          </button>
        </div>
      </div>

      {/* Active Verse Header Banner & Typography Readability Controls */}
      <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-amber-500 font-serif tracking-wide truncate">
            Focus: {activeRefKey}
          </span>
          <span className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
            Study Apparatus
          </span>
        </div>

        {/* Readability & Text Size Tools */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={toggleFontFamily}
            className="px-2 py-0.5 text-[11px] font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Switch font between Sans (Inter) and Serif (EB Garamond)"
          >
            {studyFontFamily === 'sans' ? 'Sans' : 'Serif'}
          </button>
          <div className="w-[1px] h-3 bg-slate-800" />
          <button
            onClick={() => changeStudyFontSize(-1)}
            disabled={studyFontSize <= 13}
            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded disabled:opacity-30 transition-colors cursor-pointer"
            title="Decrease text size"
          >
            A-
          </button>
          <span className="text-[11px] font-mono text-amber-400 font-semibold px-1 min-w-[28px] text-center select-none">
            {studyFontSize}px
          </span>
          <button
            onClick={() => changeStudyFontSize(1)}
            disabled={studyFontSize >= 24}
            className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded disabled:opacity-30 transition-colors cursor-pointer"
            title="Increase text size"
          >
            A+
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Commentaries Engine */}
        {activeStudyTab === 'commentary' && (
          <div className="space-y-4">
            {/* Commentary Source Filter Pills with shortcut hints (1-4) */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg text-xs border border-slate-800">
              {(['all', 'gill', 'henry', 'jfb'] as CommentarySourceFilter[]).map((src) => {
                const isSelected = activeCommentarySource === src;
                const label =
                  src === 'all'
                    ? 'All (4)'
                    : src === 'gill'
                    ? 'John Gill (1)'
                    : src === 'henry'
                    ? 'M. Henry (2)'
                    : 'JFB (3)';

                return (
                  <button
                    key={src}
                    onClick={() => setActiveCommentarySource(src)}
                    className={`flex-1 py-1 px-1.5 rounded-md text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-800 text-slate-100 shadow-xs font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Commentary Blocks (Virtual/Chunked rendering for fast scrolling) */}
            <div className="space-y-4">
              {commentarySourcesToShow.map((source) => {
                const comm = getCommentaryForVerse(currentBook, currentChapter, activeVerse, source);
                const meta = COMMENTARY_METADATA[source];

                return (
                  <div
                    key={source}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs space-y-2 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">
                          {meta.author}
                        </h4>
                        <span className="text-[10px] uppercase font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                          {meta.title} • {meta.era}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{ fontSize: `${studyFontSize}px`, lineHeight: 1.7 }}
                      className={`${studyFontFamily === 'serif' ? 'font-serif' : 'font-sans'} text-slate-100 prose prose-invert max-w-none pt-1.5 prose-p:text-slate-100 prose-p:leading-relaxed prose-strong:text-amber-400 prose-headings:text-slate-50`}
                      dangerouslySetInnerHTML={{ __html: comm.contentHtml }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Strong's Concordance & Lexicon */}
        {activeStudyTab === 'strongs' && (
          <div className="space-y-4">
            {selectedStrongs ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    Strong's #{selectedStrongs.number}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {selectedStrongs.occurrences} Biblical Occurrences
                  </span>
                </div>

                {/* Original Hebrew/Greek Lemma Display */}
                <div className="text-center py-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="text-3xl sm:text-4xl font-serif text-slate-50 font-bold mb-1 tracking-wider">
                    {selectedStrongs.lemma}
                  </div>
                  <div className="text-sm font-mono text-slate-300">
                    Transliteration: <strong className="text-amber-400 font-semibold">{selectedStrongs.transliteration}</strong>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">
                    Pronunciation: [{selectedStrongs.pronunciation}]
                  </div>
                </div>

                {/* Grammatical details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="block text-xs text-slate-400 uppercase font-semibold tracking-wider">Part of Speech</span>
                    <span className="text-sm font-medium text-slate-100">{selectedStrongs.partOfSpeech}</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="block text-xs text-slate-400 uppercase font-semibold tracking-wider">Derivation</span>
                    <span className="text-sm font-medium text-slate-100 line-clamp-1">{selectedStrongs.derivation}</span>
                  </div>
                </div>

                {/* Definition */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-amber-500/90 uppercase tracking-wider">
                    Exhaustive Concordance Definition:
                  </span>
                  <p
                    style={{ fontSize: `${studyFontSize}px`, lineHeight: 1.65 }}
                    className={`text-slate-100 ${studyFontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
                  >
                    {selectedStrongs.definition}
                  </p>
                </div>

                {/* KJV / Translation distribution */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Canonical Translation Usages:
                  </span>
                  <p
                    style={{ fontSize: `${Math.max(13, studyFontSize - 1)}px`, lineHeight: 1.6 }}
                    className="font-mono text-slate-200"
                  >
                    {selectedStrongs.kjvTranslation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">
                Click any Strong's tag in the scripture pane to inspect the Hebrew or Greek lemma.
              </div>
            )}

            {/* Quick Lexicon list for current verse */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Lexicon terms in this Chapter:
              </h5>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(STRONGS_LEXICON).slice(0, 8).map((entry) => (
                  <button
                    key={entry.number}
                    onClick={() => setSelectedStrongs(entry)}
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-amber-500/30 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-500">{entry.number}</span>
                      <span className="text-xs sm:text-sm font-serif font-semibold text-slate-100">{entry.lemma}</span>
                    </div>
                    <span className="text-xs text-slate-300 block truncate mt-0.5">{entry.transliteration}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Treasury of Scripture Knowledge (TSK) Cross-References */}
        {activeStudyTab === 'crossref' && (
          <div className="space-y-3.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span>Treasury of Scripture Knowledge ({tskRefs.length})</span>
              <span className="text-[11px] text-slate-400 font-normal lowercase">cross-references</span>
            </div>

            <div className="space-y-3">
              {tskRefs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-purple-500/50 space-y-2.5 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-purple-200 bg-purple-900/60 border border-purple-600/50 px-2.5 py-1 rounded-md tracking-wide shadow-xs">
                      {item.ref}
                    </span>
                    <button
                      onClick={() => {
                        const match = item.ref.match(/^(\d?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d+)(?::(\d+))?/);
                        if (match) {
                          navigateTo(match[1].trim(), parseInt(match[2], 10), match[3] ? parseInt(match[3], 10) : 1);
                        }
                      }}
                      className="text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/70 border border-purple-800/50 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      Jump <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {item.theme && (
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <span className="text-purple-400 font-semibold">Theme:</span>
                      <span className="text-slate-200">{item.theme}</span>
                    </div>
                  )}
                  <p
                    style={{ fontSize: `${studyFontSize}px`, lineHeight: 1.65 }}
                    className={`text-slate-100 ${studyFontFamily === 'serif' ? 'font-serif' : 'font-sans'} font-normal`}
                  >
                    "{item.previewText}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Study Notebook & Highlights */}
        {activeStudyTab === 'notes' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Study Note for {activeRefKey}
                </label>
                {savedSuccess && (
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved to IndexedDB
                  </span>
                )}
              </div>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Write your reflection, Greek/Hebrew exegetical insights, or sermons notes for this verse..."
                rows={5}
                style={{ fontSize: `${studyFontSize}px`, lineHeight: 1.6 }}
                className={`w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl outline-hidden text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 transition-colors ${studyFontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Add Tags (comma separated):
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="doctrine, covenant, christology, prayer..."
                className="w-full text-xs sm:text-sm px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg outline-hidden text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleSaveNote}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Note
              </button>
              {currentUserData?.id && (
                <button
                  onClick={() => deleteUserDataItem(currentUserData.id)}
                  className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Note
                </button>
              )}
            </div>

            {/* Saved notes in chapter */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Notes in {currentBook} {currentChapter}:
              </h5>
              {userDataList.filter(u => u.verseRef.startsWith(`${currentBook} ${currentChapter}:`) && u.noteContent).length === 0 ? (
                <p className="text-xs text-slate-500 italic">No notes recorded in this chapter yet.</p>
              ) : (
                userDataList
                  .filter(u => u.verseRef.startsWith(`${currentBook} ${currentChapter}:`) && u.noteContent)
                  .map(item => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1.5"
                    >
                      <span className="font-bold text-amber-400 text-xs sm:text-sm">{item.verseRef}</span>
                      <p
                        style={{ fontSize: `${studyFontSize}px`, lineHeight: 1.6 }}
                        className={`text-slate-100 ${studyFontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
                      >
                        "{item.noteContent}"
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cloud Sync Status Bar */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between shrink-0">
        <button
          onClick={() => setCloudSyncModalOpen(true)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          title="Supabase & Storage Settings"
        >
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium">
            {cloudSyncConfig.enabled ? 'Supabase Sync Active' : 'Local Storage (IndexedDB)'}
          </span>
        </button>

        <button
          onClick={() => triggerSync()}
          disabled={isSyncing}
          className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
          title="Sync Now"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
