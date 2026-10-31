import React, { useState } from 'react';
import { Budget, SpendingStats } from '../types';
import {
  Target,
  Edit2,
  Check,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface BudgetsPageProps {
  budgets: Budget[];
  stats: SpendingStats;
  currency: string;
  onUpdateBudget: (type: 'weekly' | 'monthly' | 'yearly', amount: number) => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  budgets,
  stats,
  currency,
  onUpdateBudget,
  onNavigate,
}) => {
  const [editingType, setEditingType] = useState<'weekly' | 'monthly' | 'yearly' | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const getBudgetValue = (type: 'weekly' | 'monthly' | 'yearly') => {
    return budgets.find((b) => b.budget_type === type)?.budget_amount || 0;
  };

  const getSpentValue = (type: 'weekly' | 'monthly' | 'yearly') => {
    if (type === 'weekly') return stats.weeklySpent;
    if (type === 'monthly') return stats.monthlySpent;
    return stats.yearlySpent;
  };

  const handleStartEdit = (type: 'weekly' | 'monthly' | 'yearly') => {
    setEditingType(type);
    setInputAmount(String(getBudgetValue(type) || (type === 'weekly' ? 5000 : type === 'monthly' ? 20000 : 240000)));
  };

  const handleSaveBudget = async () => {
    if (!editingType) return;
    const num = parseFloat(inputAmount);
    if (!num || num <= 0) return;

    try {
      setSaving(true);
      await onUpdateBudget(editingType, num);
      setEditingType(null);
    } catch (err) {
      console.error('Failed to update budget:', err);
    } finally {
      setSaving(false);
    }
  };

  const budgetCards = [
    {
      type: 'weekly' as const,
      title: 'Weekly Data Budget',
      description: 'Caps your data top-ups from Monday to Sunday',
      budget: getBudgetValue('weekly'),
      spent: getSpentValue('weekly'),
      period: 'Week',
      icon: Target,
    },
    {
      type: 'monthly' as const,
      title: 'Monthly Data Budget',
      description: 'Your primary limit across all Nigerian telco networks',
      budget: getBudgetValue('monthly'),
      spent: getSpentValue('monthly'),
      period: 'Month',
      icon: ShieldCheck,
      isPrimary: true,
    },
    {
      type: 'yearly' as const,
      title: 'Yearly Data Budget',
      description: 'Long-term telecommunications mobile capital allocation',
      budget: getBudgetValue('yearly'),
      spent: getSpentValue('yearly'),
      period: 'Year',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Budget Management & Spending Limits
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set custom spending boundaries and receive proactive alerts before you run into overages
          </p>
        </div>

        <button
          onClick={() => handleStartEdit('monthly')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Adjust Monthly Limit</span>
        </button>
      </div>

      {/* Primary Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {budgetCards.map((b) => {
          const usedPct = b.budget > 0 ? (b.spent / b.budget) * 100 : 0;
          const remaining = Math.max(0, b.budget - b.spent);
          const isOver = b.spent > b.budget && b.budget > 0;
          const isWarning = usedPct >= 75 && !isOver;

          return (
            <div
              key={b.type}
              className={`relative rounded-3xl border bg-white p-6 shadow-xs dark:bg-slate-900 transition-all ${
                b.isPrimary
                  ? 'border-blue-300 dark:border-blue-700/60 ring-2 ring-blue-500/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {b.isPrimary && (
                <span className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                  Primary Budget
                </span>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {b.description}
                  </p>
                </div>

                <button
                  onClick={() => handleStartEdit(b.type)}
                  title="Edit budget"
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              {/* Budget Figures */}
              <div className="mt-5 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Limit vs Spent
                  </span>
                  <span
                    className={`text-xs font-black ${
                      isOver
                        ? 'text-rose-600 dark:text-rose-400'
                        : isWarning
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {usedPct.toFixed(1)}% Used
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {currency}{b.spent.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-400">
                    / {currency}{b.budget.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar with 50%, 75%, 90% markers */}
              <div className="mt-4">
                <div className="relative h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isOver
                        ? 'bg-rose-600'
                        : usedPct >= 90
                        ? 'bg-rose-500'
                        : usedPct >= 75
                        ? 'bg-amber-500'
                        : usedPct >= 50
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, usedPct))}%` }}
                  />
                </div>

                {/* Threshold Markers */}
                <div className="mt-1 flex justify-between text-[10px] text-slate-600 dark:text-slate-300 font-semibold">
                  <span>0%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>90%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Remaining Balance or Over limit status */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    {isOver ? 'Budget Deficit:' : 'Remaining Balance:'}
                  </span>
                  <span
                    className={`font-black text-sm ${
                      isOver
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {currency}
                    {isOver
                      ? (b.spent - b.budget).toLocaleString() + ' Over'
                      : remaining.toLocaleString()}
                  </span>
                </div>

                {isOver ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Exceeded</span>
                  </span>
                ) : isWarning ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Warning</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="h-3 w-3" />
                    <span>On Track</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* In-Line Budget Edit Modal */}
      {editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Set {editingType.toUpperCase()} Budget Limit
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter the maximum amount you wish to spend in {currency}
            </p>

            <div className="mt-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-lg font-bold text-slate-400">
                  {currency}
                </span>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Quick suggestions */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(editingType === 'weekly'
                  ? [3000, 5000, 8000, 10000]
                  : editingType === 'monthly'
                  ? [10000, 15000, 20000, 30000, 50000]
                  : [120000, 180000, 240000, 360000]
                ).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInputAmount(String(val))}
                    className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    {currency}{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingType(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveBudget}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Limit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Budget Recommendations */}
      <div className="rounded-3xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50/50 p-6 shadow-xs dark:border-blue-900/50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Gemma AI Budget Optimization</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recommended Budget for Next Month: {currency}{Math.round(stats.monthlySpent * 0.95 || 20000).toLocaleString()}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              By consolidating recurring weekly micro-bundles on {stats.mostExpensiveNetwork} into a single monthly plan and utilizing Glo or Airtel night browsing, you can comfortably shave ~{currency}2,500 off your current monthly burn rate.
            </p>
          </div>

          <button
            onClick={() => onNavigate('ai')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all shrink-0 cursor-pointer"
          >
            <span>Ask Gemma for Plan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
