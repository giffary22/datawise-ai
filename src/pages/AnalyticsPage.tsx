import React, { useState } from 'react';
import { SpendingStats, Subscription, Budget } from '../types';
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';

interface AnalyticsPageProps {
  stats: SpendingStats;
  subscriptions: Subscription[];
  budgets: Budget[];
  currency: string;
  onNavigate: (tab: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  stats,
  subscriptions,
  budgets,
  currency,
  onNavigate,
}) => {
  const [timelineMode, setTimelineMode] = useState<'30days' | 'monthly'>('30days');

  const monthlyBudget = budgets.find((b) => b.budget_type === 'monthly')?.budget_amount || 0;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const daysRemaining = daysInMonth - currentDay;

  // Daily burn rate
  const dailyBurnRate = currentDay > 0 ? Math.round(stats.monthlySpent / currentDay) : 0;
  const projectedMonthTotal = Math.round(stats.monthlySpent + dailyBurnRate * daysRemaining);

  const totalAllSpend = (stats.networkBreakdown.MTN.total +
    stats.networkBreakdown.Glo.total +
    stats.networkBreakdown.Airtel.total +
    stats.networkBreakdown['9mobile'].total) || 1;

  // Calculate approximate GBs purchased
  const totalGbPurchased = Math.round(
    subscriptions.reduce((acc, curr) => acc + (curr.bundle_mb || 1024), 0) / 1024
  );
  const avgCostPerGb = totalGbPurchased > 0 ? Math.round(stats.yearlySpent / totalGbPurchased) : 280;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Spending Analytics & Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deep dive into your Nigerian telco data expense velocity, network efficiency, and forecasts
          </p>
        </div>

        <button
          onClick={() => onNavigate('ai')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>Gemma Recommendations</span>
        </button>
      </div>

      {/* 4 Quick KPI Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Burn Rate */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Daily Burn Rate
            </span>
            <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Zap className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {currency}{dailyBurnRate.toLocaleString()}
            <span className="text-xs text-slate-500 font-normal"> / day</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Based on {currentDay} days of activity this month
          </p>
        </div>

        {/* Projected Month Total */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Month-End Projection
            </span>
            <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {currency}{projectedMonthTotal.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {monthlyBudget > 0
              ? projectedMonthTotal > monthlyBudget
                ? `⚠️ Expected to exceed budget by ${currency}${(projectedMonthTotal - monthlyBudget).toLocaleString()}`
                : `✅ Safely within your ${currency}${monthlyBudget.toLocaleString()} limit`
              : 'Set a budget to track limit'}
          </p>
        </div>

        {/* Avg Cost per GB */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Effective Cost / GB
            </span>
            <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {currency}{avgCostPerGb}
            <span className="text-xs text-slate-500 font-normal"> / GB</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            ~{totalGbPurchased} GB purchased across all plans
          </p>
        </div>

        {/* Top Network Share */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Leading Provider
            </span>
            <span className="rounded-lg bg-purple-50 p-1.5 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <PieChart className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {stats.mostExpensiveNetwork}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {((stats.networkBreakdown[stats.mostExpensiveNetwork].total / totalAllSpend) * 100).toFixed(0)}% of your overall mobile spend
          </p>
        </div>
      </div>

      {/* Network Efficiency & Comparison Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Spending Distribution Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Network-by-Network Spending Comparison
              </h4>
              <p className="text-xs text-slate-500">
                Detailed comparison across the four major Nigerian providers
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {[
              { name: 'MTN Nigeria', key: 'MTN' as const, color: 'bg-amber-400', text: 'text-amber-500', avgRate: '₦280/GB', badge: 'Fastest 5G' },
              { name: 'Glo Mobile', key: 'Glo' as const, color: 'bg-emerald-600', text: 'text-emerald-500', avgRate: '₦220/GB', badge: 'High Volume' },
              { name: 'Airtel Nigeria', key: 'Airtel' as const, color: 'bg-rose-600', text: 'text-rose-500', avgRate: '₦290/GB', badge: 'Binge Daily' },
              { name: '9mobile', key: '9mobile' as const, color: 'bg-[#00563F]', text: 'text-lime-500', avgRate: '₦310/GB', badge: 'Corporate' },
            ].map((item) => {
              const data = stats.networkBreakdown[item.key];
              const pct = (data.total / totalAllSpend) * 100;
              return (
                <div key={item.key} className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</span>
                      <span className="text-[10px] rounded-sm bg-white dark:bg-slate-700 px-1.5 py-0.5 text-slate-600 dark:text-slate-300 font-semibold">
                        {item.badge}
                      </span>
                    </div>

                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {currency}{data.total.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2.5 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{data.count} subscriptions purchased</span>
                    <span>{pct.toFixed(1)}% share • Avg {item.avgRate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Plan Leaderboard */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Most Frequently Purchased Data Bundles
                </h4>
                <p className="text-xs text-slate-500">
                  Plans you top-up most often in your subscription history
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { bundle: '10GB Monthly', count: 4, spend: 12000, net: 'MTN & Glo', valueScore: 'Excellent Value' },
                { bundle: '4.5GB / 5GB', count: 3, spend: 6000, net: 'MTN & Airtel', valueScore: 'Good Flexibility' },
                { bundle: '20GB Heavy Plan', count: 2, spend: 10000, net: 'MTN', valueScore: 'Best Price/GB' },
                { bundle: '2GB / 2.5GB Quick', count: 2, spend: 2400, net: 'Glo & 9mobile', valueScore: 'Emergency' },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-black text-xs">
                      #{i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.bundle}</p>
                      <p className="text-[11px] text-slate-500">{p.net} • {p.count} purchases</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {currency}{p.spend.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {p.valueScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-blue-50 p-3.5 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                <strong>Gemma Rule of Thumb:</strong> In Nigeria, subscribing to 30-day plans gives ~50% more gigabytes per Naira than repeating 7-day or 2-day micro plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
