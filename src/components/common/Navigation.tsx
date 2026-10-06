import React from 'react';
import { UserRole } from '../../types';
import {
  Home,
  Mountain,
  CloudRain,
  ShieldAlert,
  TestTube2,
  Waves,
  Building2,
  Mic,
  Compass,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  currentRole: UserRole;
  onOpenVoiceAssistant: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  onOpenVoiceAssistant,
}) => {
  const farmerTabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'field', label: 'My Field', icon: Mountain },
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'before_apply', label: 'Before You Apply', icon: ShieldAlert },
    { id: 'soil', label: 'Soil Testing', icon: TestTube2 },
    { id: 'watershed', label: 'Watershed', icon: Waves },
  ];

  if (currentRole === 'officer') {
    farmerTabs.push({ id: 'officer', label: 'Officer Command', icon: Building2 });
  }

  return (
    <>
      {/* Desktop Top Sub-Nav Strip */}
      <nav className="hidden md:block bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-1">
            {farmerTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Floating Ask AgroShield Button (Mobile & Desktop) */}
      <div className="fixed bottom-20 md:bottom-6 right-5 z-40">
        <button
          type="button"
          onClick={onOpenVoiceAssistant}
          className="group flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 border border-emerald-600/40"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <Mic className="h-4 w-4" />
          <span className="tracking-wide uppercase">Ask AgroShield</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar (Section 25) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="flex items-center justify-around">
          {farmerTabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors ${
                  isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
