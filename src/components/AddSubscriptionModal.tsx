import React, { useState, useEffect } from 'react';
import { NetworkType, Subscription } from '../types';
import { X, Calendar, CreditCard, Sparkles, AlertCircle, Check } from 'lucide-react';

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Subscription>) => Promise<void>;
  editSub?: Subscription | null;
  defaultNetwork?: NetworkType;
  currency: string;
}

const NETWORK_PRESETS: Record<NetworkType, Array<{ bundle: string; amount: number; validity: string }>> = {
  MTN: [
    { bundle: '1.5GB', amount: 1000, validity: '30 days' },
    { bundle: '4.5GB', amount: 2000, validity: '30 days' },
    { bundle: '10GB', amount: 3000, validity: '30 days' },
    { bundle: '20GB', amount: 5000, validity: '30 days' },
    { bundle: '2.5GB (2-Day)', amount: 600, validity: '2 days' },
  ],
  Glo: [
    { bundle: '2.5GB', amount: 1000, validity: '30 days' },
    { bundle: '5.8GB', amount: 2000, validity: '30 days' },
    { bundle: '10GB', amount: 3000, validity: '30 days' },
    { bundle: '18GB', amount: 4000, validity: '30 days' },
    { bundle: '1GB (Sunday)', amount: 300, validity: '1 day' },
  ],
  Airtel: [
    { bundle: '1.5GB', amount: 1200, validity: '30 days' },
    { bundle: '3GB', amount: 1500, validity: '7 days' },
    { bundle: '5GB (Binge)', amount: 1500, validity: '2 days' },
    { bundle: '10GB', amount: 3000, validity: '30 days' },
    { bundle: '20GB', amount: 5000, validity: '30 days' },
  ],
  '9mobile': [
    { bundle: '1.5GB', amount: 1000, validity: '30 days' },
    { bundle: '2GB', amount: 1200, validity: '30 days' },
    { bundle: '4.5GB', amount: 2000, validity: '30 days' },
    { bundle: '11GB', amount: 4000, validity: '30 days' },
    { bundle: '1GB (Night)', amount: 200, validity: '1 day' },
  ],
};

const PAYMENT_METHODS = ['OPay', 'PalmPay', 'Bank Transfer', 'USSD', 'Debit Card', 'Airtime Recharge'];

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editSub,
  defaultNetwork = 'MTN',
  currency,
}) => {
  const [network, setNetwork] = useState<NetworkType>(defaultNetwork);
  const [bundleSize, setBundleSize] = useState<string>('10GB');
  const [amount, setAmount] = useState<string>('3000');
  const [purchaseDate, setPurchaseDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [validity, setValidity] = useState<string>('30 days');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('OPay');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editSub) {
      setNetwork(editSub.network);
      setBundleSize(editSub.bundle_size);
      setAmount(String(editSub.amount));
      setPurchaseDate(editSub.purchase_date.split('T')[0]);
      setValidity(editSub.validity || '30 days');
      setDescription(editSub.description || '');
      setPaymentMethod(editSub.payment_method || 'OPay');
    } else {
      setNetwork(defaultNetwork);
      setBundleSize('10GB');
      setAmount('3000');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setValidity('30 days');
      setDescription('');
      setPaymentMethod('OPay');
    }
    setError('');
  }, [editSub, defaultNetwork, isOpen]);

  if (!isOpen) return null;

  // Real-time expiry estimation
  const calculateExpiry = () => {
    const p = new Date(purchaseDate || Date.now());
    let days = 30;
    const v = validity.toLowerCase();
    if (v.includes('1 day')) days = 1;
    else if (v.includes('2 day')) days = 2;
    else if (v.includes('7 day')) days = 7;
    else if (v.includes('14 day')) days = 14;
    else if (v.includes('60 day')) days = 60;
    const exp = new Date(p);
    exp.setDate(exp.getDate() + days);
    return exp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleApplyPreset = (preset: { bundle: string; amount: number; validity: string }) => {
    setBundleSize(preset.bundle);
    setAmount(String(preset.amount));
    setValidity(preset.validity);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (!bundleSize.trim()) {
      setError('Please specify a data bundle size (e.g., 2GB, 10GB).');
      return;
    }

    try {
      setLoading(true);
      await onSave({
        network,
        bundle_size: bundleSize.trim(),
        amount: numAmount,
        purchase_date: new Date(purchaseDate).toISOString(),
        validity,
        description: description.trim(),
        payment_method: paymentMethod,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {editSub ? 'Edit Data Subscription' : 'Record New Data Subscription'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track your mobile internet expenses and maintain budget precision
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* 1. Select Network */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Telecommunications Network
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['MTN', 'Glo', 'Airtel', '9mobile'] as NetworkType[]).map((net) => {
                const isSelected = network === net;
                const colors = {
                  MTN: 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
                  Glo: 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
                  Airtel: 'border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
                  '9mobile': 'border-lime-500 bg-emerald-950/20 text-emerald-900 dark:bg-emerald-950/60 dark:text-lime-300',
                };

                return (
                  <button
                    type="button"
                    key={net}
                    onClick={() => {
                      setNetwork(net);
                      // Set default bundle for this network
                      const firstPreset = NETWORK_PRESETS[net][2] || NETWORK_PRESETS[net][0];
                      if (!editSub && firstPreset) {
                        handleApplyPreset(firstPreset);
                      }
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 py-2.5 px-1 font-bold text-xs transition-all ${
                      isSelected
                        ? `${colors[net]} shadow-xs scale-102`
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'
                    }`}
                  >
                    <span>{net}</span>
                    <span className="text-[10px] font-normal opacity-75">
                      {net === 'MTN' ? '*312#' : net === 'Glo' ? '*312#' : net === 'Airtel' ? '*312#' : '*200#'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Preset Buttons for Selected Network */}
          <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Popular {network} Plans in Nigeria:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {NETWORK_PRESETS[network].map((p, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleApplyPreset(p)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    bundleSize === p.bundle && amount === String(p.amount)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 hover:bg-blue-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {p.bundle} • {currency}{p.amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Bundle Size & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Bundle Size
              </label>
              <input
                type="text"
                placeholder="e.g. 10GB or 1.5GB"
                value={bundleSize}
                onChange={(e) => setBundleSize(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount Paid ({currency})
              </label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="50"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* 3. Validity & Purchase Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subscription Validity
              </label>
              <select
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="1 day">1 Day (Daily)</option>
                <option value="2 days">2 Days (Binge)</option>
                <option value="7 days">7 Days (Weekly)</option>
                <option value="14 days">14 Days (Bi-weekly)</option>
                <option value="30 days">30 Days (Monthly)</option>
                <option value="60 days">60 Days (2 Months)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Expiry Banner Preview */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50 px-3.5 py-2 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            <span className="font-medium">Estimated Expiry Date:</span>
            <span className="font-extrabold">{calculateExpiry()}</span>
          </div>

          {/* 4. Payment Method & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method (Optional)
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purpose / Description (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Work Mifi, Instagram, Netflix"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{editSub ? 'Update Subscription' : 'Save Subscription'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
