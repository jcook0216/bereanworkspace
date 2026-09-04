import React from 'react';
import { useBereanStore } from '../store/useBereanStore';
import {
  Scroll,
  Search,
  Keyboard,
  Cloud,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  HelpCircle
} from 'lucide-react';

export const WorkspaceHeader: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    leftPaneOpen,
    setLeftPaneOpen,
    rightPaneOpen,
    setRightPaneOpen,
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    setCloudSyncModalOpen,
    cloudSyncConfig
  } = useBereanStore();

  return (
    <header
      id="workspace-header"
      className="h-12 bg-[#0F0F12] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 shadow-xs z-30 select-none"
    >
      {/* Left: Brand & Pane Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLeftPaneOpen(!leftPaneOpen)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title={leftPaneOpen ? 'Collapse Left Pane' : 'Expand Left Pane'}
        >
          {leftPaneOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-500 text-black flex items-center justify-center font-bold text-xs shadow-xs">
            B
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
              Berean Workspace
              <span className="text-[10px] font-mono text-slate-400 font-normal border border-slate-800 bg-slate-900 px-1 py-0.2 rounded">
                Acts 17:11
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Expository Scripture Apparatus & Interlinear Study
            </p>
          </div>
        </div>
      </div>

      {/* Center: Command Palette Trigger Button (CMD+K) */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-900 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-xs rounded-md border border-slate-700 shadow-2xs transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            <span className="truncate">
              Search or jump to... (e.g. <strong className="font-semibold text-slate-300">Gen 1:1</strong>, <strong className="font-semibold text-slate-300">John 1:1</strong>)
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions & Right Pane Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCloudSyncModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-md border border-amber-500/20 transition-colors"
          title="Cloud & IndexedDB Sync Settings"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span className="hidden md:inline">
            {cloudSyncConfig.enabled ? 'Supabase Synced' : 'Local IDB'}
          </span>
        </button>

        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Keyboard Shortcuts Guide (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={() => setRightPaneOpen(!rightPaneOpen)}
          className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title={rightPaneOpen ? 'Collapse Study Pane' : 'Expand Study Pane'}
        >
          {rightPaneOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
