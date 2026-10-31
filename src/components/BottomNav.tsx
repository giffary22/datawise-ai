import React from 'react';
import { LayoutDashboard, Receipt, Sparkles, Target, UserCheck } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subs', icon: Receipt },
    { id: 'ai', label: 'Gemma AI', icon: Sparkles, highlight: true },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        if (tab.highlight) {
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative -top-3 flex flex-col items-center cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <Sparkles className="h-6 w-6 text-amber-300" />
              </div>
              <span className="mt-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 transition-colors cursor-pointer ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black' : 'font-semibold'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
