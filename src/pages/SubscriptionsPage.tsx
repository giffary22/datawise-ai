import React, { useState, useMemo } from 'react';
import { Subscription, NetworkType } from '../types';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  Printer,
  ChevronDown,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { api } from '../services/api';

interface SubscriptionsPageProps {
  subscriptions: Subscription[];
  currency: string;
  initialNetworkFilter?: NetworkType | 'ALL';
  onAddSubscription: () => void;
  onEditSubscription: (sub: Subscription) => void;
  onDeleteSubscription: (id: string) => Promise<void>;
}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({
  subscriptions,
  currency,
  initialNetworkFilter = 'ALL',
  onAddSubscription,
  onEditSubscription,
  onDeleteSubscription,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [networkFilter, setNetworkFilter] = useState<NetworkType | 'ALL'>(initialNetworkFilter);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'highest' | 'lowest' | 'size'>('recent');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredSubscriptions = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return subscriptions
      .filter((s) => {
        // Network filter
        if (networkFilter !== 'ALL' && s.network !== networkFilter) return false;

        // Time filter
        const pDate = new Date(s.purchase_date);
        if (timeFilter === 'week' && pDate < startOfWeek) return false;
        if (timeFilter === 'month' && pDate < startOfMonth) return false;
        if (timeFilter === 'year' && pDate < startOfYear) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            s.network.toLowerCase().includes(q) ||
            s.bundle_size.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q)) ||
            (s.payment_method && s.payment_method.toLowerCase().includes(q)) ||
            String(s.amount).includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime();
        }
        if (sortBy === 'highest') {
          return b.amount - a.amount;
        }
        if (sortBy === 'lowest') {
          return a.amount - b.amount;
        }
        if (sortBy === 'size') {
          return (b.bundle_mb || 0) - (a.bundle_mb || 0);
        }
        return 0;
      });
  }, [subscriptions, networkFilter, timeFilter, searchQuery, sortBy]);

  // Export to CSV
  const handleExportCSV = () => {
    const exportUrl = api.getExportUrl('csv');
    const a = document.createElement('a');
    a.href = exportUrl;
    a.download = `datawise-subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Printable Report view
  const handlePrint = () => {
    window.print();
  };

  const totalFilteredAmount = filteredSubscriptions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Subscription History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive audit log of all your mobile data bundle subscriptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={onAddSubscription}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subscription</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by network, bundle size, description, or payment method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-600 font-medium"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-blue-600"
            >
              <option value="recent">Sort by Most Recent</option>
              <option value="oldest">Sort by Oldest</option>
              <option value="highest">Sort by Highest Amount</option>
              <option value="lowest">Sort by Lowest Amount</option>
              <option value="size">Sort by Largest Bundle</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Network Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">Network:</span>
            {(['ALL', 'MTN', 'Glo', 'Airtel', '9mobile'] as Array<'ALL' | NetworkType>).map((net) => (
              <button
                key={net}
                onClick={() => setNetworkFilter(net)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                  networkFilter === net
                    ? net === 'MTN'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : net === 'Glo'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : net === 'Airtel'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : net === '9mobile'
                      ? 'bg-[#00563F] text-lime-400 shadow-2xs'
                      : 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {net === 'ALL' ? 'All Networks' : net}
              </button>
            ))}
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">Time:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'year', label: 'This Year' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id as any)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  timeFilter === t.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Banner for Filtered Results */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500">
        <span>
          Showing <strong>{filteredSubscriptions.length}</strong> recorded subscriptions
        </span>
        <span>
          Filtered Total: <strong className="text-slate-900 dark:text-white font-extrabold">{currency}{totalFilteredAmount.toLocaleString()}</strong>
        </span>
      </div>

      {/* Records Table & Cards */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {filteredSubscriptions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Calendar className="h-7 w-7" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              No subscription records match your criteria
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, selecting "All Networks", or click "+ Add Subscription" to record a new plan.
            </p>
            <button
              onClick={onAddSubscription}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record Data Purchase</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Network & Bundle</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Date Purchased</th>
                  <th className="py-3.5 px-4">Validity & Expiry</th>
                  <th className="py-3.5 px-4">Purpose / Tag</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredSubscriptions.map((sub) => {
                  const isExpiringSoon =
                    new Date(sub.expiry_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 &&
                    new Date(sub.expiry_date).getTime() > new Date().getTime();

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Network & Bundle */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black uppercase ${
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
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {sub.bundle_size}
                            </span>
                            <span className="text-[11px] text-slate-500">{sub.network}</span>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {currency}
                          {sub.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Purchase Date */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(sub.purchase_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Validity & Expiry */}
                      <td className="py-3 px-4">
                        <div>
                          <span className="text-slate-800 dark:text-slate-200 block">
                            {sub.validity}
                          </span>
                          <span
                            className={`text-[11px] ${
                              isExpiringSoon ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-500'
                            }`}
                          >
                            Expires:{' '}
                            {new Date(sub.expiry_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Purpose */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 max-w-[150px] truncate">
                          {sub.description ? (
                            <>
                              <Tag className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{sub.description}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {sub.payment_method || 'OPay'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditSubscription(sub)}
                            title="Edit subscription"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {deleteConfirmId === sub.id ? (
                            <div className="inline-flex items-center gap-1 animate-in fade-in duration-100">
                              <button
                                onClick={async () => {
                                  await onDeleteSubscription(sub.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="rounded-lg p-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(sub.id)}
                              title="Delete record"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
