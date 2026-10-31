import React from 'react';
import { NetworkType, Subscription } from '../types';
import { Plus, ArrowRight, Wifi, Sparkles } from 'lucide-react';

interface NetworkCardProps {
  network: NetworkType;
  totalSpent: number;
  count: number;
  percentage: number;
  recentSubscription?: Subscription;
  currency: string;
  onViewHistory: (network: NetworkType) => void;
  onAddSubscription: (network: NetworkType) => void;
}

export const NetworkCard: React.FC<NetworkCardProps> = ({
  network,
  totalSpent,
  count,
  percentage,
  recentSubscription,
  currency,
  onViewHistory,
  onAddSubscription,
}) => {
  // Brand styles customized for Nigerian Telcos
  const getNetworkConfig = (net: NetworkType) => {
    switch (net) {
      case 'MTN':
        return {
          brandName: 'MTN Nigeria',
          slogan: 'Everywhere You Go',
          badgeBg: 'bg-amber-400 text-slate-950 font-black',
          cardBorder: 'border-amber-300 dark:border-amber-500/40 hover:border-amber-400',
          accentBg: 'bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400',
          progressBar: 'bg-amber-400',
          glow: 'group-hover:shadow-amber-500/15',
          logoInitial: 'MTN',
          code: '*312#',
        };
      case 'Glo':
        return {
          brandName: 'Glo Mobile',
          slogan: 'Grandmasters of Data',
          badgeBg: 'bg-emerald-600 text-white font-bold',
          cardBorder: 'border-emerald-300 dark:border-emerald-500/40 hover:border-emerald-500',
          accentBg: 'bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400',
          progressBar: 'bg-emerald-500',
          glow: 'group-hover:shadow-emerald-500/15',
          logoInitial: 'GLO',
          code: '*312#',
        };
      case 'Airtel':
        return {
          brandName: 'Airtel Nigeria',
          slogan: 'The Smartphone Network',
          badgeBg: 'bg-rose-600 text-white font-bold',
          cardBorder: 'border-rose-300 dark:border-rose-500/40 hover:border-rose-500',
          accentBg: 'bg-rose-500/10 dark:bg-rose-400/10 text-rose-600 dark:text-rose-400',
          progressBar: 'bg-rose-500',
          glow: 'group-hover:shadow-rose-500/15',
          logoInitial: 'airtel',
          code: '*312#',
        };
      case '9mobile':
        return {
          brandName: '9mobile',
          slogan: 'Here For You',
          badgeBg: 'bg-[#00563F] text-lime-400 font-bold border border-lime-500/40',
          cardBorder: 'border-emerald-700/50 dark:border-emerald-600/40 hover:border-lime-500',
          accentBg: 'bg-[#00563F]/15 dark:bg-[#00563F]/40 text-emerald-700 dark:text-lime-400',
          progressBar: 'bg-lime-500',
          glow: 'group-hover:shadow-emerald-900/20',
          logoInitial: '9m',
          code: '*200#',
        };
    }
  };

  const config = getNetworkConfig(network);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${config.cardBorder} ${config.glow}`}
    >
      <div>
        {/* Header: Logo, Name & Quick USSD code */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm tracking-wider uppercase shadow-xs ${config.badgeBg}`}
            >
              {config.logoInitial}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{config.brandName}</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{config.slogan}</p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {config.code}
          </span>
        </div>

        {/* Spend Figures */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300">Total Spent</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{percentage.toFixed(0)}% of total</span>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {currency}
              {totalSpent.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">({count} {count === 1 ? 'bundle' : 'bundles'})</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${config.progressBar}`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>

        {/* Recent Subscription info */}
        <div className="mt-4 rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Most Recent:</span>
          {recentSubscription ? (
            <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-200">
              <span className="truncate">{recentSubscription.bundle_size} for {currency}{recentSubscription.amount.toLocaleString()}</span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 shrink-0 ml-2">
                {new Date(recentSubscription.purchase_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ) : (
            <span className="text-slate-600 dark:text-slate-300 italic">No subscriptions recorded yet</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => onViewHistory(network)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <span>History</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => onAddSubscription(network)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all shadow-xs ${config.badgeBg}`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Data</span>
        </button>
      </div>
    </div>
  );
};
