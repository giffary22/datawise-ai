import React, { useState } from 'react';
import { SpendingStats, Subscription, NetworkType, Budget } from '../types';
import { NetworkCard } from '../components/NetworkCard';
import { SpendingCharts } from '../components/SpendingCharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';

interface DashboardPageProps {
  stats: SpendingStats;
  subscriptions: Subscription[];
  budgets: Budget[];
  currency: string;
  onOpenAddModal: (defaultNetwork?: NetworkType) => void;
  onNavigate: (tab: string, filterNetwork?: NetworkType) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  subscriptions,
  budgets,
  currency,
  onOpenAddModal,
  onNavigate,
}) => {
  const [spendingView, setSpendingView] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all');

  const monthlyBudget = budgets.find((b) => b.budget_type === 'monthly')?.budget_amount || 0;
  const budgetUsedPct = monthlyBudget > 0 ? (stats.monthlySpent / monthlyBudget) * 100 : 0;
  const budgetRemaining = Math.max(0, monthlyBudget - stats.monthlySpent);

  const totalAllSpend = (stats.networkBreakdown.MTN.total +
    stats.networkBreakdown.Glo.total +
    stats.networkBreakdown.Airtel.total +
    stats.networkBreakdown['9mobile'].total) || 1;

  // Recent 3 subscriptions
  const recentSubs = subscriptions.slice(0, 3);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner: Quick Action & Gemma AI Recommendation ticker */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-xs text-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Gemma AI Spending Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              DataWise Mobile Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
              You have spent{' '}
              <strong className="text-white underline decoration-amber-400 font-extrabold">
                {currency}{stats.monthlySpent.toLocaleString()}
              </strong>{' '}
              on mobile data this month across Nigerian networks.
              {monthlyBudget > 0 && (
                <span>
                  {' '}You are currently at <strong>{budgetUsedPct.toFixed(0)}%</strong> of your {currency}{monthlyBudget.toLocaleString()} monthly limit.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenAddModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-black text-slate-950 shadow-md hover:bg-amber-300 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record Subscription</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20 transition-all border border-white/20 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Analyze Habits</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-1/3 -top-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      {/* 3 Prominent Interactive Spending Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Spending Overview</span>
          </h3>
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setSpendingView('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                spendingView === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSpendingView('weekly')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                spendingView === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSpendingView('monthly')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                spendingView === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setSpendingView('yearly')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                spendingView === 'yearly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. WEEKLY SPENDING */}
          <div
            className={`rounded-2xl border p-5 shadow-xs transition-all ${
              spendingView === 'weekly' || spendingView === 'all'
                ? 'border-blue-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                : 'opacity-50 border-slate-200 bg-slate-50 dark:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">
                Weekly Spending
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Calendar className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currency}
                {stats.weeklySpent.toLocaleString()}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              {stats.weeklyPctChange >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +{stats.weeklyPctChange.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {stats.weeklyPctChange.toFixed(1)}%
                </span>
              )}
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                vs last week ({currency}{stats.lastWeekSpent.toLocaleString()})
              </span>
            </div>

            {/* Mini Sparkline indicator */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Weekly burn rate</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                ~{currency}{Math.round(stats.weeklySpent / 7).toLocaleString()}/day
              </span>
            </div>
          </div>

          {/* 2. MONTHLY SPENDING */}
          <div
            className={`rounded-2xl border p-5 shadow-xs transition-all ${
              spendingView === 'monthly' || spendingView === 'all'
                ? 'border-indigo-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                : 'opacity-50 border-slate-200 bg-slate-50 dark:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">
                Monthly Spending
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Zap className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currency}
                {stats.monthlySpent.toLocaleString()}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              {stats.monthlyPctChange >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +{stats.monthlyPctChange.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {stats.monthlyPctChange.toFixed(1)}%
                </span>
              )}
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                vs prev month ({currency}{stats.prevMonthSpent.toLocaleString()})
              </span>
            </div>

            {/* Monthly Budget Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Monthly Budget</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {budgetUsedPct.toFixed(0)}% ({currency}{budgetRemaining.toLocaleString()} left)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsedPct > 90 ? 'bg-rose-500' : budgetUsedPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, budgetUsedPct))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. YEARLY SPENDING */}
          <div
            className={`rounded-2xl border p-5 shadow-xs transition-all ${
              spendingView === 'yearly' || spendingView === 'all'
                ? 'border-purple-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                : 'opacity-50 border-slate-200 bg-slate-50 dark:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400">
                Yearly Spending
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {currency}
                {stats.yearlySpent.toLocaleString()}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                {stats.totalSubscriptionsCount} subscriptions
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300">purchased in {new Date().getFullYear()}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Avg cost per sub</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {currency}
                {stats.totalSubscriptionsCount > 0
                  ? Math.round(stats.yearlySpent / stats.totalSubscriptionsCount).toLocaleString()
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Network Subscription Cards: MTN, Glo, Airtel, 9mobile */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Nigerian Telecommunications Networks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Individual spending and subscription totals by provider
            </p>
          </div>
          <button
            onClick={() => onNavigate('subscriptions')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>All records</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['MTN', 'Glo', 'Airtel', '9mobile'] as NetworkType[]).map((net) => {
            const data = stats.networkBreakdown[net];
            const pct = (data.total / totalAllSpend) * 100;
            return (
              <NetworkCard
                key={net}
                network={net}
                totalSpent={data.total}
                count={data.count}
                percentage={pct}
                recentSubscription={data.recent}
                currency={currency}
                onViewHistory={(selectedNet) => onNavigate('subscriptions', selectedNet)}
                onAddSubscription={(selectedNet) => onOpenAddModal(selectedNet)}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive Spending Charts */}
      <SpendingCharts stats={stats} subscriptions={subscriptions} currency={currency} />

      {/* Recent Activity List & Quick Gemma Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Recent Data Purchases
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest subscriptions recorded across all networks
              </p>
            </div>
            <button
              onClick={() => onNavigate('subscriptions')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {recentSubs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No subscription transactions logged yet. Click "+ Record Subscription" above to start!
              </div>
            ) : (
              recentSubs.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black uppercase ${
                        sub.network === 'MTN'
                          ? 'bg-amber-400 text-slate-950'
                          : sub.network === 'Glo'
                          ? 'bg-emerald-600 text-white'
                          : sub.network === 'Airtel'
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#00563F] text-lime-400'
                      }`}
                    >
                      {sub.network === '9mobile' ? '9m' : sub.network}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {sub.network} • {sub.bundle_size}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(sub.purchase_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        • Valid for {sub.validity} {sub.description ? `• ${sub.description}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {currency}
                      {sub.amount.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-600 dark:text-slate-300">
                      {sub.payment_method || 'OPay'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Gemma AI Advisor card */}
        <div className="rounded-2xl border border-blue-200 bg-linear-to-b from-blue-50 to-indigo-50/40 p-5 shadow-xs dark:border-blue-900/40 dark:from-slate-900 dark:to-blue-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Gemma AI Spending Insight</span>
            </div>

            <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
              Optimize your {stats.mostExpensiveNetwork} Plan
            </h4>

            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You frequently purchase <strong>{stats.mostFrequentBundle}</strong>. Based on your consumption, consolidating small recurring bundles into a single 30-day plan can save you up to <strong>{currency}3,500 every month</strong>.
            </p>

            <div className="mt-4 rounded-xl bg-white/80 p-3 text-xs dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/50">
              <span className="text-slate-500 block text-[11px]">Primary Recommendation:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                Switch 2x weekly bundles to 1x Monthly 20GB
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('ai')}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <span>Ask Gemma AI Assistant</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
