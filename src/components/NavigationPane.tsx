import React, { useState } from 'react';
import { useBereanStore } from '../store/useBereanStore';
import { BIBLE_BOOKS } from '../data/bibleBooks';
import { TRANSLATION_CONFIG } from '../data/scriptureDataset';
import { searchEngine, SearchResult } from '../services/searchEngine';
import {
  BookOpen,
  Search,
  Bookmark,
  Layers,
  ChevronRight,
  DownloadCloud,
  Check,
  Hash,
  FileText,
  Sparkles
} from 'lucide-react';
import { Testament, TranslationId } from '../types';

export const NavigationPane: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    navigateTo,
    userDataList,
    downloadedTranslations,
    downloadTranslationModule,
    setSelectedStrongs
  } = useBereanStore();

  const [activeNavTab, setActiveNavTab] = useState<'books' | 'search' | 'saved' | 'modules'>('books');
  const [testamentFilter, setTestamentFilter] = useState<Testament | 'ALL'>('ALL');
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedBookForChapters, setSelectedBookForChapters] = useState<string>(currentBook);

  // Filter books list
  const filteredBooks = BIBLE_BOOKS.filter((b) => {
    const matchesTestament = testamentFilter === 'ALL' || b.testament === testamentFilter;
    const matchesQuery = b.name.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
                         b.shortName.toLowerCase().includes(bookSearchQuery.toLowerCase());
    return matchesTestament && matchesQuery;
  });

  const selectedBookObj = BIBLE_BOOKS.find(b => b.name === selectedBookForChapters) || BIBLE_BOOKS[0];

  const handleSearchExecute = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      const res = searchEngine.search(q, 20);
      setSearchResults(res);
    } else {
      setSearchResults([]);
    }
  };

  const savedNotesAndHighlights = userDataList.filter(u => u.colorHighlight || u.noteContent);

  return (
    <div
      id="left-navigation-pane"
      className="h-full flex flex-col bg-[#0F0F12] border-r border-slate-800 select-none overflow-hidden text-slate-300"
    >
      {/* Top Pane Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0F0F12] p-1.5 shrink-0">
        <div className="grid grid-cols-4 gap-1 w-full">
          <button
            onClick={() => setActiveNavTab('books')}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeNavTab === 'books'
                ? 'bg-slate-800/90 text-amber-500 shadow-xs border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Canon Books & Chapters"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Canon</span>
          </button>
          <button
            onClick={() => setActiveNavTab('search')}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeNavTab === 'search'
                ? 'bg-slate-800/90 text-amber-500 shadow-xs border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="FlexSearch"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
          </button>
          <button
            onClick={() => setActiveNavTab('saved')}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeNavTab === 'saved'
                ? 'bg-slate-800/90 text-amber-500 shadow-xs border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Notes & Highlights"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saved</span>
          </button>
          <button
            onClick={() => setActiveNavTab('modules')}
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              activeNavTab === 'modules'
                ? 'bg-slate-800/90 text-amber-500 shadow-xs border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
            title="Translations"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bibles</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Books & Chapter Selector */}
      {activeNavTab === 'books' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick Filter */}
          <div className="p-2.5 border-b border-slate-800 space-y-2">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg text-[11px] font-medium text-slate-400 border border-slate-800">
              <button
                onClick={() => setTestamentFilter('ALL')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  testamentFilter === 'ALL' ? 'bg-slate-800 text-slate-100 shadow-2xs font-semibold' : 'hover:text-slate-200'
                }`}
              >
                All 66
              </button>
              <button
                onClick={() => setTestamentFilter('OT')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  testamentFilter === 'OT' ? 'bg-slate-800 text-slate-100 shadow-2xs font-semibold' : 'hover:text-slate-200'
                }`}
              >
                OT (39)
              </button>
              <button
                onClick={() => setTestamentFilter('NT')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  testamentFilter === 'NT' ? 'bg-slate-800 text-slate-100 shadow-2xs font-semibold' : 'hover:text-slate-200'
                }`}
              >
                NT (27)
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                placeholder="Filter book by name..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg outline-hidden text-slate-200 placeholder:text-slate-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-12 min-h-0">
            {/* Books Column */}
            <div className="col-span-7 border-r border-slate-800 overflow-y-auto divide-y divide-slate-800/60">
              {filteredBooks.map((b) => {
                const isSelected = b.name === selectedBookForChapters;
                const isCurrent = b.name === currentBook;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBookForChapters(b.name)}
                    className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 font-semibold text-amber-500 border-l-2 border-amber-500'
                        : isCurrent
                        ? 'bg-slate-800/60 text-slate-100 font-medium'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <span>{b.name}</span>
                      <span className="block text-[10px] font-normal text-slate-500 truncate">
                        {b.category}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  </div>
                );
              })}
            </div>

            {/* Chapters Grid Column */}
            <div className="col-span-5 p-2 overflow-y-auto bg-[#0A0A0B]/60">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                {selectedBookObj.shortName} Chapters
              </div>
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: selectedBookObj.chaptersCount }, (_, i) => i + 1).map((ch) => {
                  const isActive = selectedBookObj.name === currentBook && ch === currentChapter;
                  return (
                    <button
                      key={ch}
                      onClick={() => navigateTo(selectedBookObj.name, ch, 1)}
                      className={`h-7 rounded-md text-xs font-medium flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-amber-500 text-black font-bold shadow-xs'
                          : 'bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-slate-100 border border-slate-700/80'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FlexSearch */}
      {activeNavTab === 'search' && (
        <div className="flex-1 flex flex-col min-h-0 p-3">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchExecute(e.target.value)}
              placeholder="Search keyword (e.g. grace, light, Logos, H7225)..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg outline-hidden text-slate-200 placeholder:text-slate-500 focus:border-amber-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {searchResults.length === 0 && searchQuery.trim() ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No matching verses found for "{searchQuery}".
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-slate-400 text-xs space-y-3 p-2">
                <p className="font-semibold text-slate-300">Quick Search Examples:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Gen 1:1', 'John 3:16', 'grace', 'in the beginning', 'shepherd', 'H7225', 'G3056'].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearchExecute(term)}
                      className="text-[11px] px-2 py-1 bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 rounded-md border border-slate-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
                  Tip: Use <kbd className="font-mono bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700">⌘K</kbd> anywhere for instant Command Palette jumping!
                </p>
              </div>
            ) : (
              searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.type === 'strongs' && item.strongsData) {
                      setSelectedStrongs(item.strongsData);
                    } else {
                      navigateTo(item.book, item.chapter, item.verse || 1);
                    }
                  }}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-amber-500/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-500">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Saved Notes & Highlights */}
      {activeNavTab === 'saved' && (
        <div className="flex-1 flex flex-col min-h-0 p-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Study Notes & Highlights ({savedNotesAndHighlights.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {savedNotesAndHighlights.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="font-medium text-slate-400">No saved notes or highlights yet</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click any verse in the center pane to highlight in color or attach study notes.
                </p>
              </div>
            ) : (
              savedNotesAndHighlights.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    const match = item.verseRef.match(/^(\d?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d+)(?::(\d+))?/);
                    if (match) {
                      navigateTo(match[1].trim(), parseInt(match[2], 10), match[3] ? parseInt(match[3], 10) : 1);
                    }
                  }}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {item.colorHighlight && (
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-slate-600"
                          style={{ backgroundColor: item.colorHighlight }}
                        />
                      )}
                      {item.verseRef}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {item.noteContent && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic bg-slate-900 p-1.5 rounded border border-slate-800">
                      "{item.noteContent}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Translation Modules */}
      {activeNavTab === 'modules' && (
        <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Translation Modules (SQLite / Local)
          </div>
          <p className="text-xs text-slate-400">
            The Berean Workspace ships with NASB pre-installed. You can toggle or download ASV, NKJV, and NLT modules for offline study.
          </p>

          <div className="space-y-2.5">
            {(Object.keys(TRANSLATION_CONFIG) as TranslationId[]).map((tId) => {
              const cfg = TRANSLATION_CONFIG[tId];
              const isDownloaded = downloadedTranslations.includes(tId);

              return (
                <div
                  key={tId}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      {cfg.short}
                      {cfg.hasStrongs && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30 font-normal">
                          Strong's Tagged
                        </span>
                      )}
                    </span>
                    {isDownloaded ? (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <button
                        onClick={() => downloadTranslationModule(tId)}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-full border border-slate-700 transition-colors"
                      >
                        <DownloadCloud className="w-3 h-3" /> Download
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">{cfg.name}</div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {cfg.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Info Banner */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[10px] flex justify-between items-center shrink-0">
        <span className="text-slate-500 font-mono">Hotkeys: [1-4] Commentary</span>
        <span className="text-amber-500 font-bold font-mono">Acts 17:11</span>
      </div>
    </div>
  );
};
