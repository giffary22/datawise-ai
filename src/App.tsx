/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { api } from './services/api';
import { SpendingStats, Subscription, Budget, Notification, NetworkType } from './types';

// Components & Pages
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';

import { DashboardPage } from './pages/DashboardPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { ProfilePage } from './pages/ProfilePage';

import { Sparkles, Loader2, Plus, Zap, AlertCircle } from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading, isOnboardingOpen, setIsOnboardingOpen, switchDemoUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeNetworkFilter, setActiveNetworkFilter] = useState<NetworkType | 'ALL'>('ALL');

  // Core Data States
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<SpendingStats>({
    weeklySpent: 0,
    lastWeekSpent: 0,
    weeklyPctChange: 0,
    monthlySpent: 0,
    prevMonthSpent: 0,
    monthlyPctChange: 0,
    yearlySpent: 0,
    prevYearSpent: 0,
    yearlyPctChange: 0,
    totalSubscriptionsCount: 0,
    networkBreakdown: {
      MTN: { total: 0, count: 0 },
      Glo: { total: 0, count: 0 },
      Airtel: { total: 0, count: 0 },
      '9mobile': { total: 0, count: 0 },
    },
    mostExpensiveNetwork: 'MTN',
    mostFrequentBundle: '10GB',
  });
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [defaultAddNetwork, setDefaultAddNetwork] = useState<NetworkType>('MTN');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch all applet data for active user
  const loadAppData = useCallback(async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const [subsRes, budgetsRes, analyticsRes, notifsRes] = await Promise.all([
        api.getSubscriptions(),
        api.getBudgets(),
        api.getAnalytics(),
        api.getNotifications(),
      ]);

      setSubscriptions(subsRes.subscriptions || []);
      setBudgets(budgetsRes.budgets || []);
      setNotifications(notifsRes.notifications || []);
      if (analyticsRes.stats) {
        setStats(analyticsRes.stats);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAppData();
  }, [loadAppData]);

  // Handlers for Subscriptions
  const handleSaveSubscription = async (data: Partial<Subscription>) => {
    if (editingSub) {
      await api.updateSubscription(editingSub.id, data);
      showToast('Subscription updated successfully!');
    } else {
      await api.addSubscription(data);
      showToast('New subscription recorded successfully!');
    }
    await loadAppData();
  };

  const handleDeleteSubscription = async (id: string) => {
    await api.deleteSubscription(id);
    showToast('Subscription record removed.');
    await loadAppData();
  };

  const handleUpdateBudget = async (type: 'weekly' | 'monthly' | 'yearly', amount: number) => {
    await api.setBudget(type, amount);
    showToast(`${type.toUpperCase()} budget updated!`);
    await loadAppData();
  };

  // Notifications
  const handleMarkNotifRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const handleMarkAllNotifsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast('All notifications marked as read.');
  };

  const handleDeleteNotif = async (id: string) => {
    await api.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNavigateWithNetwork = (tab: string, filterNet?: NetworkType) => {
    if (filterNet) {
      setActiveNetworkFilter(filterNet);
    } else {
      setActiveNetworkFilter('ALL');
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const currency = user?.currency || '₦';

  // Loading Screen
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 animate-bounce">
          <Zap className="h-7 w-7 fill-white text-white" />
        </div>
        <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white tracking-tight">
          DataWise AI
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Loading smart subscription tracker...
        </p>
      </div>
    );
  }

  // Not logged in empty/auth landing view
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4">
          <Zap className="h-8 w-8 fill-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          DataWise AI 🇳🇬
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
          Intelligent mobile data subscription and budget tracking for Nigerian users across MTN, Glo, Airtel, and 9mobile.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all cursor-pointer"
          >
            Sign In / Register
          </button>
          <button
            onClick={async () => {
              await switchDemoUser();
            }}
            className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Explore with Demo Account
          </button>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenAddModal={() => {
          setEditingSub(null);
          setDefaultAddNetwork(user?.primary_network || 'MTN');
          setIsAddModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onNavigate={handleNavigateWithNetwork}
        unreadCount={unreadCount}
      />

      {/* Main Body with Desktop Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onNavigate={handleNavigateWithNetwork}
          currency={currency}
        />

        {/* Dynamic Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              subscriptions={subscriptions}
              budgets={budgets}
              currency={currency}
              onOpenAddModal={(net) => {
                setEditingSub(null);
                setDefaultAddNetwork(net || user?.primary_network || 'MTN');
                setIsAddModalOpen(true);
              }}
              onNavigate={handleNavigateWithNetwork}
            />
          )}

          {currentTab === 'subscriptions' && (
            <SubscriptionsPage
              subscriptions={subscriptions}
              currency={currency}
              initialNetworkFilter={activeNetworkFilter}
              onAddSubscription={() => {
                setEditingSub(null);
                setDefaultAddNetwork(user?.primary_network || 'MTN');
                setIsAddModalOpen(true);
              }}
              onEditSubscription={(sub) => {
                setEditingSub(sub);
                setIsAddModalOpen(true);
              }}
              onDeleteSubscription={handleDeleteSubscription}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage
              stats={stats}
              subscriptions={subscriptions}
              budgets={budgets}
              currency={currency}
              onNavigate={handleNavigateWithNetwork}
            />
          )}

          {currentTab === 'budgets' && (
            <BudgetsPage
              budgets={budgets}
              stats={stats}
              currency={currency}
              onUpdateBudget={handleUpdateBudget}
              onNavigate={handleNavigateWithNetwork}
            />
          )}

          {currentTab === 'ai' && (
            <AiAssistantPage
              stats={stats}
              subscriptions={subscriptions}
              budgets={budgets}
              currency={currency}
              onNavigate={handleNavigateWithNetwork}
            />
          )}

          {currentTab === 'profile' && <ProfilePage currency={currency} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav currentTab={currentTab} onNavigate={handleNavigateWithNetwork} />

      {/* Modals & Drawers */}
      <AddSubscriptionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSub(null);
        }}
        onSave={handleSaveSubscription}
        editSub={editingSub}
        defaultNetwork={defaultAddNetwork}
        currency={currency}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
        onDelete={handleDeleteNotif}
        onNavigate={handleNavigateWithNetwork}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onFinish={() => {
          setIsOnboardingOpen(false);
          loadAppData();
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl dark:bg-white dark:text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
