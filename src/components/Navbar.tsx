import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bell,
  Plus,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  User as UserIcon,
  LogOut,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onOpenNotifications: () => void;
  onNavigate: (tab: string) => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onOpenNotifications,
  onNavigate,
  unreadCount,
}) => {
  const { user, logout, switchDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      {/* Left: Greeting & Current Date */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo Brand */}
        <div className="flex md:hidden items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-sm">
            DW
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {getGreeting()},{' '}
              <span className="text-blue-600 dark:text-blue-400">
                {user?.full_name ? user.full_name.split(' ')[0] : 'User'}
              </span>
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              🇳🇬 {user?.primary_network || 'MTN'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {currentDateFormatted}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ask Gemma AI shortcut */}
        <button
          onClick={() => onNavigate('ai')}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>Ask Gemma AI</span>
        </button>

        {/* Quick Add Subscription */}
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 text-xs font-bold dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Add Data</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
          )}
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.full_name}
                className="h-8 w-8 rounded-xl object-cover ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
            )}
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Sliders className="h-4 w-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>

                <button
                  onClick={async () => {
                    await switchDemoUser();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Switch / Reset Demo Data</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
