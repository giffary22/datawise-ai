import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { NetworkType } from '../types';
import { Check, Sparkles, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onFinish: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onFinish }) => {
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [currency, setCurrency] = useState<string>('₦');
  const [primaryNetwork, setPrimaryNetwork] = useState<NetworkType>('MTN');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(15000);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      setSubmitting(true);
      await completeOnboarding({
        currency,
        primary_network: primaryNetwork,
        monthly_budget: monthlyBudget,
      });

      // Celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#FACC15', '#10B981', '#F43F5E'],
        });
      } catch {}

      onFinish();
    } catch (err) {
      console.error('Failed to save onboarding:', err);
      onFinish();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-8 bg-blue-600'
                    : i < step
                    ? 'w-2 bg-blue-400'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Step {step} of 4
          </span>
        </div>

        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
              <Sparkles className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Welcome to DataWise AI! 🇳🇬
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Hello <span className="font-bold text-slate-900 dark:text-white">{user?.full_name || 'Friend'}</span>.
                We help Nigerian users track mobile data subscriptions across MTN, Glo, Airtel, and 9mobile, prevent unexpected bundle runouts, and optimize mobile spending with Google's Gemma AI.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 text-left space-y-2 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Zero guesswork on where your monthly data budget goes</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <TrendingUp className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Instant alerts at 50%, 75%, 90%, and 100% budget limits</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Gemma AI recommendations on the best telecom bundle deals</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Preferred Currency */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Select Your Preferred Currency
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                DataWise AI defaults to Nigerian Naira (₦), but you can customize your display symbol.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { symbol: '₦', name: 'Nigerian Naira (NGN)', popular: true },
                { symbol: '$', name: 'US Dollar (USD)', popular: false },
                { symbol: '£', name: 'British Pound (GBP)', popular: false },
                { symbol: '€', name: 'Euro (EUR)', popular: false },
              ].map((c) => (
                <button
                  type="button"
                  key={c.symbol}
                  onClick={() => setCurrency(c.symbol)}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
                    currency === c.symbol
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl font-black">{c.symbol}</span>
                    {c.popular && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold mt-2">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Primary Network */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Choose Your Primary Network
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Which telecom network do you use the most for your daily browsing or hotspot?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { id: 'MTN', name: 'MTN Nigeria', desc: 'Yellow network, *312#', bg: 'border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30' },
                { id: 'Glo', name: 'Glo Mobile', desc: 'Grandmasters of Data, *312#', bg: 'border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30' },
                { id: 'Airtel', name: 'Airtel Nigeria', desc: 'The Smartphone Network, *312#', bg: 'border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30' },
                { id: '9mobile', name: '9mobile', desc: 'Here For You, *200#', bg: 'border-lime-500 hover:bg-emerald-950/30' },
              ].map((net) => (
                <button
                  type="button"
                  key={net.id}
                  onClick={() => setPrimaryNetwork(net.id as NetworkType)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    primaryNetwork === net.id
                      ? `${net.bg} ring-2 ring-blue-500 shadow-md`
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">{net.name}</span>
                    {primaryNetwork === net.id && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{net.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic text-center">
              Don't worry, you can always track multiple networks anytime!
            </p>
          </div>
        )}

        {/* STEP 4: Monthly Budget */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Set Your Monthly Data Budget
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                How much do you plan or wish to limit your mobile data spending to each month?
              </p>
            </div>

            <div className="pt-2">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xl font-extrabold text-slate-400">
                  {currency}
                </span>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-blue-500 bg-white dark:bg-slate-800 text-2xl font-black text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {/* Quick Preset Chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[5000, 10000, 15000, 20000, 30000, 50000].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setMonthlyBudget(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      monthlyBudget === preset
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {currency}{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
              💡 <strong>Smart Pace:</strong> This equates to approximately {currency}{Math.round(monthlyBudget / 4).toLocaleString()} per week. We will notify you whenever you hit 50%, 75%, and 90% of this limit.
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {submitting ? (
              <span>Saving...</span>
            ) : step === 4 ? (
              <>
                <span>Launch My Dashboard</span>
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
