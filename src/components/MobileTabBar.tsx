import React from 'react';
import { useBereanStore } from '../store/useBereanStore';
import { BookOpen, Book, Languages, PenSquare, Search } from 'lucide-react';

export const MobileTabBar: React.FC = () => {
  const { mobileActiveTab, setMobileActiveTab } = useBereanStore();

  const tabs = [
    { id: 'scripture', label: 'Scripture', icon: Book },
    { id: 'study', label: 'Study & Notes', icon: Languages },
    { id: 'nav', label: 'Canon & Search', icon: BookOpen },
  ] as const;

  return (
    <div
      id="mobile-navigation-bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F0F12] border-t border-slate-800 px-4 py-2 flex items-center justify-around shadow-lg"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = mobileActiveTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setMobileActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isActive
                ? 'text-amber-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
