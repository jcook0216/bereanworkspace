import React, { useEffect } from 'react';
import { useBereanStore } from '../store/useBereanStore';
import { X, Keyboard, Command } from 'lucide-react';

export const KeyboardShortcutsModal: React.FC = () => {
  const { shortcutsModalOpen, setShortcutsModalOpen } = useBereanStore();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setShortcutsModalOpen(!shortcutsModalOpen);
      }
      if (e.key === 'Escape' && shortcutsModalOpen) {
        setShortcutsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shortcutsModalOpen, setShortcutsModalOpen]);

  if (!shortcutsModalOpen) return null;

  const shortcuts = [
    { keys: ['⌘', 'K'], label: 'Open Command Palette (Search & Reference Jump)' },
    { keys: ['←', '→'], label: 'Navigate to Previous / Next Chapter' },
    { keys: ['1'], label: 'Toggle John Gill’s Exposition' },
    { keys: ['2'], label: 'Toggle Matthew Henry’s Commentary (Complete)' },
    { keys: ['3'], label: 'Toggle Jamieson-Fausset-Brown (JFB) Commentary' },
    { keys: ['4'], label: 'View All Commentaries Combined' },
    { keys: ['P'], label: 'Toggle Parallel Scripture Translation Mode' },
    { keys: ['S'], label: 'Toggle Strong\'s Concordance Numbers' },
    { keys: ['?'], label: 'Open this Keyboard Shortcuts Guide' },
    { keys: ['Esc'], label: 'Close active popovers, modals, and menus' }
  ];

  return (
    <div
      id="shortcuts-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={() => setShortcutsModalOpen(false)}
    >
      <div
        id="shortcuts-modal-card"
        className="w-full max-w-md bg-[#0F0F12] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-[#0A0A0B] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-400">
                Desktop-First Scholarly Navigation
              </p>
            </div>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-xs text-slate-300 font-medium">
                {sc.label}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {sc.keys.map((k, ki) => (
                  <kbd
                    key={ki}
                    className="min-w-6 text-center px-2 py-1 text-xs font-mono font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded shadow-xs"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-[#0A0A0B] border-t border-slate-800 text-center">
          <span className="text-xs text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-400 border border-slate-700 rounded font-mono text-[10px]">?</kbd> anywhere in the app to summon this cheatsheet.
          </span>
        </div>
      </div>
    </div>
  );
};
