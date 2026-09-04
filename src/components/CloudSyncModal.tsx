import React, { useState } from 'react';
import { useBereanStore } from '../store/useBereanStore';
import { localDB } from '../services/db';
import { X, Cloud, CloudCheck, RefreshCw, Download, Upload, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export const CloudSyncModal: React.FC = () => {
  const {
    cloudSyncModalOpen,
    setCloudSyncModalOpen,
    cloudSyncConfig,
    updateCloudConfig,
    triggerSync,
    isSyncing,
    syncNotice,
    userDataList
  } = useBereanStore();

  const [supabaseUrl, setSupabaseUrl] = useState(cloudSyncConfig.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(cloudSyncConfig.supabaseKey || '');
  const [enabled, setEnabled] = useState(cloudSyncConfig.enabled || false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  if (!cloudSyncModalOpen) return null;

  const handleSaveConfig = async () => {
    await updateCloudConfig({
      enabled,
      supabaseUrl,
      supabaseKey
    });
    if (enabled) {
      triggerSync();
    }
  };

  const handleExport = async () => {
    try {
      const json = await localDB.exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `berean_workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Export failed: ${e.message}`);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const count = await localDB.importBackup(text);
        setImportNotice(`Successfully imported ${count} items into IndexedDB!`);
        setTimeout(() => setImportNotice(null), 4000);
      } catch (err: any) {
        setImportNotice(`Import error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const highlightedCount = userDataList.filter((u) => u.colorHighlight).length;
  const notesCount = userDataList.filter((u) => u.noteContent.trim().length > 0).length;

  return (
    <div
      id="cloud-sync-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={() => setCloudSyncModalOpen(false)}
    >
      <div
        id="cloud-sync-modal-card"
        className="w-full max-w-lg bg-[#0F0F12] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0A0A0B] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Storage & Cloud Synchronization
              </h3>
              <p className="text-xs text-slate-400">
                Local IndexedDB & Supabase Sync Bridge
              </p>
            </div>
          </div>
          <button
            onClick={() => setCloudSyncModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Local Storage Stats */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Database className="w-4 h-4 text-amber-500" />
              <span>Local Storage (IndexedDB)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="block text-xl font-bold text-slate-100">{highlightedCount}</span>
                <span className="text-[11px] text-slate-400">Scripture Highlights</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="block text-xl font-bold text-slate-100">{notesCount}</span>
                <span className="text-[11px] text-slate-400">Study Notes</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Scripture texts (NASB, ASV, NKJV, NLT) and commentaries remain stored locally for instant zero-lag offline access.
            </p>
          </div>

          {/* Cloud Sync Config */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-100">
                  Supabase Backend Cloud Sync
                </h4>
                <p className="text-xs text-slate-400">
                  Sync your highlights, notes, and study bookmarks across devices
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {enabled && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Table schema: <code className="font-mono bg-slate-950 border border-slate-800 px-1 py-0.5 rounded text-amber-400">user_data (id, verse_ref, note_content, color_highlight, timestamp)</code>.
                  If left empty, local encrypted replica is used.
                </p>
              </div>
            )}

            {syncNotice && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{syncNotice}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Save Settings
              </button>
              <button
                onClick={() => triggerSync()}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
              {cloudSyncConfig.lastSynced && (
                <span className="text-[11px] text-slate-400 ml-auto">
                  Last synced: {new Date(cloudSyncConfig.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-sm font-semibold text-slate-100 mb-2">
              Portable Backup & Restore
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Export all your notes and color highlights to a portable JSON file, or restore from a previous backup.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                Export JSON Backup
              </button>
              <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                Import Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
            {importNotice && (
              <p className="text-xs font-medium text-emerald-400 mt-2">{importNotice}</p>
            )}
          </div>
        </div>

        <div className="px-5 py-3 bg-[#0A0A0B] border-t border-slate-800 text-right">
          <button
            onClick={() => setCloudSyncModalOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-100 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
