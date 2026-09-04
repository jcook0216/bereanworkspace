import React, { useEffect, useRef } from 'react';
import { useBereanStore } from '../store/useBereanStore';
import { X, BookOpen, ExternalLink } from 'lucide-react';

export const TskPopover: React.FC = () => {
  const { tskPopover, setTskPopover, navigateTo } = useBereanStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setTskPopover(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTskPopover(null);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setTskPopover]);

  if (!tskPopover) return null;

  const { verseRef, targets } = tskPopover;

  const handleJump = (ref: string) => {
    // Parse e.g. "John 1:1"
    const match = ref.match(/^(\d?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d+)(?::(\d+))?/);
    if (match) {
      const book = match[1].trim();
      const ch = parseInt(match[2], 10);
      const vs = match[3] ? parseInt(match[3], 10) : 1;
      navigateTo(book, ch, vs);
      setTskPopover(null);
    }
  };

  return (
    <div
      id="tsk-preview-popover-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div
        ref={popoverRef}
        id="tsk-preview-popover-card"
        className="w-full max-w-lg bg-[#0F0F12] rounded-xl shadow-2xl border border-slate-800 overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0B] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Treasury of Scripture Knowledge
              </h3>
              <p className="text-xs text-slate-400">
                Cross-References for <span className="font-semibold text-amber-500">{verseRef}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setTskPopover(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto space-y-3">
          {targets.map((tgt, idx) => (
            <div
              key={idx}
              className="group p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                    {tgt.ref}
                  </span>
                  {tgt.theme && (
                    <span className="text-xs font-medium text-slate-300">
                      • {tgt.theme}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleJump(tgt.ref)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-opacity"
                >
                  Jump to verse <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[15px] text-slate-100 leading-relaxed font-sans">
                "{tgt.previewText}"
              </p>
            </div>
          ))}
        </div>

        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 text-right">
          <span className="text-[11px] text-slate-500">
            TSK Scripture Cross-References • Powered by The Berean Workspace
          </span>
        </div>
      </div>
    </div>
  );
};
