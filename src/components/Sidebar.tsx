import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Sparkles,
  UserCheck,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  currency: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate, currency }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'My Subscriptions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles, badge: 'Gemma' },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shrink-0 min-h-[calc(100vh-4rem)]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg shadow-md shadow-blue-500/20">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                DataWise
              </span>
              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                AI
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Smart Telco Tracker
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Network Quick Pointers */}
      <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <span>Supported Nigerian Networks</span>
          <span className="text-emerald-500">Active</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          <div className="rounded-lg bg-amber-400 py-1.5 text-center text-[10px] font-black text-slate-950">
            MTN
          </div>
          <div className="rounded-lg bg-emerald-600 py-1.5 text-center text-[10px] font-black text-white">
            Glo
          </div>
          <div className="rounded-lg bg-rose-600 py-1.5 text-center text-[10px] font-black text-white">
            Airtel
          </div>
          <div className="rounded-lg bg-[#00563F] py-1.5 text-center text-[10px] font-black text-lime-400">
            9mob
          </div>
        </div>

        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
          AI continuously checks Nigerian telco tariff adjustments to recommend the cheapest rates.
        </p>
      </div>
    </aside>
  );
};
