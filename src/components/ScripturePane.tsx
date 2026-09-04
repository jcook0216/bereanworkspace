import React, { useState, useEffect, useRef } from 'react';
import { useBereanStore } from '../store/useBereanStore';
import { getVersesForChapter, TRANSLATION_CONFIG } from '../data/scriptureDataset';
import { STRONGS_LEXICON } from '../data/strongsLexicon';
import { getTskForVerse } from '../data/tskCrossReferences';
import { fetchChapterVerses, getApiBibleStatus, ApiBibleStatus } from '../services/apiBibleService';
import { TranslationId, Verse, VerseSegment } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Columns,
  Columns2,
  Bookmark,
  Volume2,
  VolumeX,
  Plus,
  Minus,
  Highlighter,
  MessageSquare,
  Hash,
  Sparkles,
  Share2,
  Check,
  Globe2,
  Loader2
} from 'lucide-react';

export const ScripturePane: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    activeVerse,
    setActiveVerse,
    nextChapter,
    prevChapter,
    primaryTranslation,
    setPrimaryTranslation,
    parallelTranslation,
    setParallelTranslation,
    isParallelMode,
    toggleParallelMode,
    showStrongsNumbers,
    toggleStrongsNumbers,
    redLetterEnabled,
    toggleRedLetter,
    fontSize,
    setFontSize,
    setSelectedStrongs,
    setTskPopover,
    userDataList,
    setVerseHighlight,
    setActiveStudyTab
  } = useBereanStore();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeHighlightPickerVerse, setActiveHighlightPickerVerse] = useState<number | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Chapter state: initialized from local high-fidelity dataset, augmented asynchronously from API.Bible
  const [primaryVerses, setPrimaryVerses] = useState<Verse[]>(() =>
    getVersesForChapter(currentBook, currentChapter, primaryTranslation)
  );
  const [parallelVerses, setParallelVerses] = useState<Verse[]>(() =>
    isParallelMode && parallelTranslation
      ? getVersesForChapter(currentBook, currentChapter, parallelTranslation)
      : []
  );

  const [apiStatus, setApiStatus] = useState<ApiBibleStatus | null>(null);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(false);

  // Load API.Bible status on mount
  useEffect(() => {
    getApiBibleStatus().then(status => setApiStatus(status));
  }, []);

  // Sync and fetch chapter text
  useEffect(() => {
    let isMounted = true;
    // 1. Immediately provide local/curated baseline for zero flash
    const localPrimary = getVersesForChapter(currentBook, currentChapter, primaryTranslation);
    setPrimaryVerses(localPrimary);

    if (isParallelMode && parallelTranslation) {
      setParallelVerses(getVersesForChapter(currentBook, currentChapter, parallelTranslation));
    } else {
      setParallelVerses([]);
    }

    // 2. Fetch live text from API.Bible
    setIsLoadingChapter(true);
    fetchChapterVerses(currentBook, currentChapter, primaryTranslation)
      .then((res) => {
        if (!isMounted) return;
        if (res.verses && res.verses.length > 0) {
          setPrimaryVerses(res.verses);
          setIsLiveApi(res.isLiveApi);
        }
        setIsLoadingChapter(false);
      })
      .catch(() => {
        if (isMounted) setIsLoadingChapter(false);
      });

    if (isParallelMode && parallelTranslation) {
      fetchChapterVerses(currentBook, currentChapter, parallelTranslation)
        .then((res) => {
          if (!isMounted) return;
          if (res.verses && res.verses.length > 0) {
            setParallelVerses(res.verses);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [currentBook, currentChapter, primaryTranslation, parallelTranslation, isParallelMode]);

  const containerRef = useRef<HTMLDivElement>(null);
  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Scroll to active verse if selected externally
  useEffect(() => {
    if (activeVerse && verseRefs.current[activeVerse]) {
      verseRefs.current[activeVerse]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeVerse, currentChapter, currentBook]);

  // Speech synthesis reader
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const fullChapterText = primaryVerses.map(v => `${v.verse}. ${v.text}`).join(' ');
    const utterance = new SpeechSynthesisUtterance(fullChapterText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentBook, currentChapter]);

  // Click on verse number -> open TSK Cross-Reference Popover
  const handleVerseNumberClick = (verseNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVerse(verseNum);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const verseRef = `${currentBook} ${currentChapter}:${verseNum}`;
    const tskTargets = getTskForVerse(currentBook, currentChapter, verseNum);

    setTskPopover({
      verseRef,
      anchorRect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      },
      targets: tskTargets
    });
  };

  // Click on Strong's number tag -> select in study pane
  const handleStrongsClick = (strongsNum: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const entry = STRONGS_LEXICON[strongsNum];
    if (entry) {
      setSelectedStrongs(entry);
    } else {
      setSelectedStrongs({
        number: strongsNum,
        lemma: strongsNum.startsWith('H') ? 'עִבְרִית' : 'Ἑλληνικά',
        transliteration: strongsNum,
        pronunciation: 'lexicon-ref',
        partOfSpeech: 'Original Language Term',
        definition: `Strong's Concordance term ${strongsNum} in original canonical biblical manuscript.`,
        kjvTranslation: 'biblical occurrence',
        derivation: 'Derived from biblical root form.',
        occurrences: 12
      });
    }
  };

  const copyVerse = (v: Verse) => {
    const textToCopy = `${v.book} ${v.chapter}:${v.verse} (${v.translation}) - "${v.text}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNotice(`Copied ${v.book} ${v.chapter}:${v.verse}`);
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  const HIGHLIGHT_COLORS = [
    { name: 'Amber', color: '#fef08a', border: '#fde047' },
    { name: 'Mint', color: '#bbf7d0', border: '#86efac' },
    { name: 'Sky', color: '#bae6fd', border: '#7dd3fc' },
    { name: 'Rose', color: '#fecdd3', border: '#fda4af' },
    { name: 'Lavender', color: '#e9d5ff', border: '#d8b4fe' }
  ];

  const renderSegments = (segments: VerseSegment[]) => {
    return segments.map((seg, sIdx) => {
      const isRed = seg.isRedLetter && redLetterEnabled;
      const isItalic = seg.isItalic;
      const hasStrongs = !!seg.strongs && showStrongsNumbers;

      return (
        <span key={sIdx} className={seg.isPoeticBreak ? 'block pl-5 sm:pl-8 my-0.5' : 'inline'}>
          <span
            className={`${isRed ? 'words-of-christ' : ''} ${
              isItalic ? 'supplied-word' : ''
            }`}
          >
            {seg.text}
          </span>
          {hasStrongs && seg.strongs && (
            <button
              onClick={(e) => handleStrongsClick(seg.strongs!, e)}
              className="strongs-badge text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 px-1 py-0.2 rounded hover:scale-105 transition-transform"
              title={`Strong's ${seg.strongs}: Click to examine Hebrew/Greek Lexicon`}
            >
              {seg.strongs}
            </button>
          )}
        </span>
      );
    });
  };

  return (
    <div
      id="center-scripture-pane"
      className="h-full flex flex-col bg-[#070708] select-text overflow-hidden relative"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0A0B] border-b border-slate-800 shadow-xs shrink-0 flex-wrap gap-2">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={prevChapter}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Previous Chapter (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs sm:text-sm font-serif italic text-slate-100 tracking-tight">
              {currentBook} {currentChapter}
            </span>
            <button
              onClick={nextChapter}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Next Chapter (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* Primary Translation Switcher */}
          <select
            value={primaryTranslation}
            onChange={(e) => setPrimaryTranslation(e.target.value as TranslationId)}
            className="text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 outline-hidden cursor-pointer transition-colors"
            title="Primary Translation"
          >
            {(Object.keys(TRANSLATION_CONFIG) as TranslationId[]).map((t) => (
              <option key={t} value={t}>
                {t} — {TRANSLATION_CONFIG[t].short}
              </option>
            ))}
          </select>

          {/* API.Bible Provider Status Badge */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono tracking-tight bg-slate-900/90 border border-slate-800"
            title={
              isLiveApi
                ? 'Active: Streaming live canonical scripture directly via API.Bible'
                : apiStatus?.configured
                ? 'API.Bible Key Configured: Ready for live scripture streaming'
                : 'Local High-Fidelity Corpus Active. Configure BIBLE_API_KEY in environment to stream live from API.Bible.'
            }
          >
            {isLoadingChapter ? (
              <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
            ) : (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isLiveApi
                    ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50 animate-pulse'
                    : apiStatus?.configured
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
            )}
            <span
              className={
                isLiveApi
                  ? 'text-emerald-300 font-semibold'
                  : apiStatus?.configured
                  ? 'text-amber-300'
                  : 'text-slate-400'
              }
            >
              {isLiveApi ? 'API.Bible Live' : apiStatus?.configured ? 'API.Bible' : 'Local / Offline'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Parallel Translation Mode Toggle */}
          <button
            onClick={toggleParallelMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isParallelMode
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
            }`}
            title="Toggle Parallel Translations (Press 'P')"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Parallel</span>
          </button>

          {/* Parallel Secondary Version Selector when enabled */}
          {isParallelMode && (
            <select
              value={parallelTranslation || 'ASV'}
              onChange={(e) => setParallelTranslation(e.target.value as TranslationId)}
              className="text-xs font-semibold text-amber-400 bg-slate-900 border border-amber-500/30 rounded-lg px-2 py-1.5 outline-hidden cursor-pointer"
              title="Parallel Translation"
            >
              {(Object.keys(TRANSLATION_CONFIG) as TranslationId[]).map((t) => (
                <option key={t} value={t}>
                  || {t}
                </option>
              ))}
            </select>
          )}

          {/* Strong's Toggle */}
          <button
            onClick={toggleStrongsNumbers}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showStrongsNumbers
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
            }`}
            title="Toggle Strong's Numbers (Press 'S')"
          >
            <span className="font-mono font-bold text-[11px]">H/G#</span>
          </button>

          {/* Font Size Adjusters */}
          <div className="hidden sm:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setFontSize(s => s - 1)}
              className="p-1 text-slate-400 hover:text-slate-100 rounded"
              title="Decrease Font Size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono text-slate-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize(s => s + 1)}
              className="p-1 text-slate-400 hover:text-slate-100 rounded"
              title="Increase Font Size"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speech Audio Reader */}
          <button
            onClick={toggleSpeech}
            className={`p-1.5 rounded-lg border transition-colors ${
              isPlayingAudio
                ? 'bg-amber-500 text-black border-amber-500 animate-pulse font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-slate-800'
            }`}
            title={isPlayingAudio ? 'Stop Audio Read-Aloud' : 'Read Chapter Aloud (TTS)'}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Copied alert toast */}
      {copiedNotice && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-slate-800 text-slate-100 border border-slate-700 text-xs px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{copiedNotice}</span>
        </div>
      )}

      {/* Main Scripture Text Pane */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full pb-20"
      >
        {/* Chapter Header */}
        <div className="text-center mb-8 border-b border-slate-800/80 pb-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-slate-100 font-bold tracking-tight">
            {currentBook}
          </h1>
          <p className="text-sm uppercase tracking-widest text-amber-500 font-sans font-medium mt-1">
            Chapter {currentChapter}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-400">
            <span>{TRANSLATION_CONFIG[primaryTranslation].name}</span>
            {isParallelMode && parallelTranslation && (
              <span>• Parallel: {TRANSLATION_CONFIG[parallelTranslation].short}</span>
            )}
          </div>
        </div>

        {/* Verses Container */}
        <div className="space-y-4">
          {primaryVerses.map((verse) => {
            const verseRefKey = `${verse.book} ${verse.chapter}:${verse.verse}`;
            const userData = userDataList.find(u => u.verseRef === verseRefKey);
            const userColor = userData?.colorHighlight || null;
            const hasNote = !!userData?.noteContent;
            const isActive = activeVerse === verse.verse;

            const parallelVerse = isParallelMode
              ? parallelVerses.find(pv => pv.verse === verse.verse)
              : null;

            return (
              <div
                key={verse.id}
                ref={(el) => { verseRefs.current[verse.verse] = el; }}
                onClick={() => setActiveVerse(verse.verse)}
                className={`relative group rounded-xl p-3 sm:p-4 transition-all ${
                  isActive
                    ? 'bg-slate-900/80 ring-1 ring-amber-500/40 shadow-xs'
                    : 'hover:bg-slate-900/40'
                }`}
                style={userColor ? { backgroundColor: `${userColor}25` } : undefined}
              >
                {/* Heading if present */}
                {verse.heading && (
                  <h2 className="font-sans font-semibold text-xs uppercase tracking-wider text-amber-500/90 mb-2 border-b border-slate-800 pb-1">
                    {verse.heading}
                  </h2>
                )}

                {/* Single vs Parallel Layout */}
                <div className={isParallelMode ? 'grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800' : ''}>
                  {/* Primary Scripture Column */}
                  <div className="relative">
                    {isParallelMode && (
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        {primaryTranslation}
                      </span>
                    )}

                    <div
                      className="scripture-text leading-relaxed text-slate-100"
                      style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
                    >
                      {/* Clickable Verse Number -> TSK Popover trigger */}
                      <button
                        onClick={(e) => handleVerseNumberClick(verse.verse, e)}
                        className={`inline-block font-sans font-bold text-xs mr-2 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer select-none ${
                          isActive
                            ? 'bg-amber-500 text-black font-bold shadow-xs'
                            : 'bg-slate-800 text-amber-500/80 hover:bg-amber-500 hover:text-black border border-slate-700'
                        }`}
                        title="Click to preview Treasury of Scripture Knowledge (TSK) Cross-References"
                      >
                        {verse.verse}
                      </button>

                      {/* Verse Text Segments */}
                      {renderSegments(verse.segments)}
                    </div>
                  </div>

                  {/* Parallel Scripture Column */}
                  {isParallelMode && parallelVerse && (
                    <div className="pt-2 md:pt-0 md:pl-4">
                      <span className="text-[10px] font-bold text-amber-500 block mb-1">
                        {parallelTranslation}
                      </span>
                      <div
                        className="scripture-text leading-relaxed text-slate-300 italic"
                        style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
                      >
                        <span className="inline-block font-sans font-bold text-xs mr-2 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {parallelVerse.verse}
                        </span>
                        {renderSegments(parallelVerse.segments)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Verse Action Strip (Visible on hover or when active) */}
                <div className={`mt-2.5 flex items-center justify-between pt-1.5 border-t border-slate-800/80 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } transition-opacity`}>
                  <div className="flex items-center gap-1.5">
                    {/* Highlight Picker Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHighlightPickerVerse(
                            activeHighlightPickerVerse === verse.verse ? null : verse.verse
                          );
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
                        title="Color Highlight"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">Highlight</span>
                      </button>

                      {/* Color Palette Dropdown */}
                      {activeHighlightPickerVerse === verse.verse && (
                        <div
                          className="absolute bottom-7 left-0 z-30 bg-slate-900 rounded-xl shadow-xl border border-slate-700 p-2 flex items-center gap-1.5 animate-in fade-in zoom-in-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {HIGHLIGHT_COLORS.map((c) => (
                            <button
                              key={c.name}
                              onClick={() => {
                                setVerseHighlight(verseRefKey, c.color);
                                setActiveHighlightPickerVerse(null);
                              }}
                              className="w-5 h-5 rounded-full border border-slate-600 hover:scale-115 transition-transform"
                              style={{ backgroundColor: c.color }}
                              title={c.name}
                            />
                          ))}
                          {userColor && (
                            <button
                              onClick={() => {
                                setVerseHighlight(verseRefKey, null);
                                setActiveHighlightPickerVerse(null);
                              }}
                              className="text-[10px] text-slate-400 hover:text-red-400 px-1 font-medium"
                              title="Clear Highlight"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Note Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVerse(verse.verse);
                        setActiveStudyTab('notes');
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
                      title="Add Study Note"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Note</span>
                      {hasNote && (
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      )}
                    </button>

                    {/* Copy Verse */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyVerse(verse);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
                      title="Copy Reference"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Copy</span>
                    </button>
                  </div>

                  {/* Right side reference tag */}
                  <span className="text-[10px] font-mono text-slate-500 font-medium">
                    {currentBook} {currentChapter}:{verse.verse}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chapter Bottom Navigation */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={prevChapter}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Chapter
          </button>
          <span className="text-xs text-slate-500 italic font-serif">
            The Berean Workspace • Synchronized Exegesis
          </span>
          <button
            onClick={nextChapter}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Next Chapter <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Sync Pill matching Sophisticated Dark Spec */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-4 py-1.5 rounded-full flex items-center gap-4 text-xs text-slate-400 shadow-xl pointer-events-none hidden md:flex">
        <span className="flex items-center gap-1.5 font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Synchronized
        </span>
        <span className="h-3 w-[1px] bg-slate-700"></span>
        <span>
          Verse {activeVerse} selected
        </span>
        <span className="h-3 w-[1px] bg-slate-700"></span>
        <span className="text-amber-500 font-mono text-[11px]">
          [1-4] Commentaries
        </span>
      </div>
    </div>
  );
};
