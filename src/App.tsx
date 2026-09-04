import React, { useEffect } from 'react';
import { useBereanStore } from './store/useBereanStore';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { NavigationPane } from './components/NavigationPane';
import { ScripturePane } from './components/ScripturePane';
import { StudyPane } from './components/StudyPane';
import { CommandPalette } from './components/CommandPalette';
import { TskPopover } from './components/TskPopover';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { MobileTabBar } from './components/MobileTabBar';

export default function App() {
  const {
    leftPaneOpen,
    rightPaneOpen,
    mobileActiveTab,
    initApp,
    nextChapter,
    prevChapter,
    toggleParallelMode,
    toggleStrongsNumbers,
    setShortcutsModalOpen,
    shortcutsModalOpen,
    setActiveCommentarySource
  } = useBereanStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevChapter();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextChapter();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toggleParallelMode();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        toggleStrongsNumbers();
      } else if (e.key === '1') {
        setActiveCommentarySource('gill');
      } else if (e.key === '2') {
        setActiveCommentarySource('henry');
      } else if (e.key === '3') {
        setActiveCommentarySource('jfb');
      } else if (e.key === '4') {
        setActiveCommentarySource('all');
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen(!shortcutsModalOpen);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    nextChapter,
    prevChapter,
    toggleParallelMode,
    toggleStrongsNumbers,
    setActiveCommentarySource,
    setShortcutsModalOpen,
    shortcutsModalOpen
  ]);

  return (
    <div id="berean-workspace-root" className="h-screen w-screen flex flex-col bg-[#0A0A0B] text-slate-200 overflow-hidden">
      {/* Top Application Header */}
      <WorkspaceHeader />

      {/* Main 3-Column Workspace Area */}
      <main id="workspace-layout-container" className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Pane: Navigation & Search */}
        <aside
          id="desktop-left-navigation-column"
          className={`hidden lg:block transition-all duration-200 border-r border-slate-800 bg-[#0F0F12] shrink-0 ${
            leftPaneOpen ? 'w-72 xl:w-80' : 'w-0 hidden'
          }`}
        >
          {leftPaneOpen && <NavigationPane />}
        </aside>

        {/* Mobile View Switcher */}
        <div className="lg:hidden flex-1 flex flex-col h-full overflow-hidden pb-14 bg-[#0A0A0B]">
          {mobileActiveTab === 'nav' && <NavigationPane />}
          {mobileActiveTab === 'scripture' && <ScripturePane />}
          {mobileActiveTab === 'study' && <StudyPane />}
        </div>

        {/* Desktop Center Pane: Main Scripture with Synchronized Parallel Versions */}
        <section
          id="desktop-center-scripture-column"
          className="hidden lg:flex flex-1 flex-col min-w-0 h-full overflow-hidden bg-[#070708]"
        >
          <ScripturePane />
        </section>

        {/* Desktop Right Pane: Contextual Study (Commentaries, Strong's, Cross-Refs) */}
        <aside
          id="desktop-right-study-column"
          className={`hidden lg:block transition-all duration-200 border-l border-slate-800 bg-[#0F0F12] shrink-0 ${
            rightPaneOpen ? 'w-80 xl:w-96' : 'w-0 hidden'
          }`}
        >
          {rightPaneOpen && <StudyPane />}
        </aside>
      </main>

      {/* Mobile Bottom Tab Switcher */}
      <MobileTabBar />

      {/* Global Modals & Popovers */}
      <CommandPalette />
      <TskPopover />
      <KeyboardShortcutsModal />
      <CloudSyncModal />
    </div>
  );
}
