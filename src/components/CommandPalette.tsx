import React, { useState, useEffect, useRef } from 'react';
import { useBereanStore } from '../store/useBereanStore';
import { searchEngine, SearchResult } from '../services/searchEngine';
import { Search, Book, ArrowRight, CornerDownLeft, Sparkles, Hash } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    navigateTo,
    setSelectedStrongs
  } = useBereanStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global CMD+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setResults(searchEngine.search('Gen 1:1'));
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Update search results on query change
  useEffect(() => {
    if (!commandPaletteOpen) return;
    const res = query.trim() ? searchEngine.search(query) : searchEngine.search('Gen 1:1');
    setResults(res);
    setSelectedIndex(0);
  }, [query, commandPaletteOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  const handleSelect = (item: SearchResult) => {
    if (item.type === 'strongs' && item.strongsData) {
      setSelectedStrongs(item.strongsData);
    } else {
      navigateTo(item.book, item.chapter, item.verse || 1);
    }
    setCommandPaletteOpen(false);
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      id="command-palette-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-xs"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        id="command-palette-card"
        className="w-full max-w-2xl bg-[#0F0F12] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#0A0A0B]">
          <Search className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a scripture reference (e.g. 'John 3:16', 'Gen 1'), keyword ('grace'), or Strong's (H7225)..."
            className="w-full text-base bg-transparent border-none outline-hidden text-slate-100 placeholder:text-slate-500"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/60">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Sparkles className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No scripture matches found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching "Gen 1:1", "John 1:14", "grace", "love", or "H7225"
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}_${item.ref}_${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-800/90 border border-slate-700 text-slate-100'
                      : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        item.type === 'strongs'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : item.type === 'reference'
                          ? 'bg-slate-800 text-amber-500 border border-slate-700'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.type === 'strongs' ? (
                        <Hash className="w-4 h-4" />
                      ) : (
                        <Book className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">
                          {item.title}
                        </span>
                        <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 shrink-0 mt-2">
                      <span>Jump</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">↵</kbd>
              to select
            </span>
          </div>
          <span className="font-semibold text-amber-500">
            The Berean Workspace Command Center
          </span>
        </div>
      </div>
    </div>
  );
};
