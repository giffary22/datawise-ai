import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { NetworkType } from '../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Globe,
  Bell,
  Sparkles,
  Download,
  Trash2,
  Check,
  Moon,
  Sun,
  ShieldAlert,
} from 'lucide-react';

interface ProfilePageProps {
  currency: string;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
];

export const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [currency, setCurrency] = useState(user?.currency || '₦');
  const [primaryNetwork, setPrimaryNetwork] = useState<NetworkType>(user?.primary_network || 'MTN');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || AVATAR_PRESETS[0]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Settings
  const [emailNotifs, setEmailNotifs] = useState(user?.settings?.email_notifications ?? true);
  const [budgetAlerts, setBudgetAlerts] = useState(user?.settings?.budget_alerts ?? true);
  const [expiryReminders, setExpiryReminders] = useState(user?.settings?.expiry_reminders ?? true);
  const [aiDigest, setAiDigest] = useState(user?.settings?.ai_weekly_digest ?? true);
  const [aiTone, setAiTone] = useState<'frugal' | 'balanced' | 'smart'>(user?.settings?.ai_tone || 'smart');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    const updates: any = {
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      currency,
      primary_network: primaryNetwork,
      profile_picture: profilePicture,
      settings: {
        email_notifications: emailNotifs,
        budget_alerts: budgetAlerts,
        expiry_reminders: expiryReminders,
        ai_weekly_digest: aiDigest,
        ai_tone: aiTone,
      },
    };

    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        setPasswordError('New passwords do not match.');
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters.');
        return;
      }
      updates.new_password = newPassword;
    }

    try {
      setSaving(true);
      await updateUser(updates);
      setSaveSuccess(true);
      setNewPassword('');
      setConfirmNewPassword('');
      setCurrentPassword('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPersonalData = (fmt: 'csv' | 'json') => {
    const url = api.getExportUrl(fmt);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datawise-personal-data.${fmt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      logout();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Account Profile & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal details, telecom preferences, Gemma AI behavior, and data privacy
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <Check className="h-4 w-4" />
          <span>Profile changes and preferences saved successfully!</span>
        </div>
      )}

      {passwordError && (
        <div className="rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          {passwordError}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Profile Picture & Basic Info */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Personal Information
          </h3>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Profile Avatar
            </label>
            <div className="flex items-center gap-3">
              <img
                src={profilePicture}
                alt="Selected avatar"
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-blue-500/20"
              />
              <div className="flex items-center gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfilePicture(preset)}
                    className={`h-10 w-10 rounded-xl overflow-hidden ring-2 transition-all cursor-pointer ${
                      profilePicture === preset ? 'ring-blue-600 scale-105' : 'ring-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Read-only)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-xs sm:text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Nigerian Network
              </label>
              <select
                value={primaryNetwork}
                onChange={(e) => setPrimaryNetwork(e.target.value as NetworkType)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              >
                <option value="MTN">MTN Nigeria (Yellow)</option>
                <option value="Glo">Glo Mobile (Green)</option>
                <option value="Airtel">Airtel Nigeria (Red)</option>
                <option value="9mobile">9mobile (Olive)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Preferences & Currency */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Currency & Display Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              >
                <option value="₦">₦ - Nigerian Naira (NGN)</option>
                <option value="$">$ - US Dollar (USD)</option>
                <option value="£">£ - British Pound (GBP)</option>
                <option value="€">€ - Euro (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gemma AI Personality Tone
              </label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as any)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              >
                <option value="smart">Smart Financial Advisor (Balanced)</option>
                <option value="frugal">Frugal / Extreme Cost Cutter</option>
                <option value="balanced">Friendly Companion</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Budget Threshold Alerts
                </span>
                <span className="text-[11px] text-slate-500">
                  Notify when reaching 50%, 75%, 90%, and 100% of data limits
                </span>
              </div>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(e) => setBudgetAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Subscription Expiry Reminders
                </span>
                <span className="text-[11px] text-slate-500">
                  Receive alerts 48 hours before bundle validity expires
                </span>
              </div>
              <input
                type="checkbox"
                checked={expiryReminders}
                onChange={(e) => setExpiryReminders(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Gemma AI Weekly Savings Digest
                </span>
                <span className="text-[11px] text-slate-500">
                  Automatic weekly recap of telco spend and optimization hints
                </span>
              </div>
              <input
                type="checkbox"
                checked={aiDigest}
                onChange={(e) => setAiDigest(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Security & Password Change */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            Change Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* 4. Data Export & Danger Zone */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
          Data Export & Account Management
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleDownloadPersonalData('json')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Download All Data (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadPersonalData('csv')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export Subscriptions (CSV)</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
              Danger Zone
            </span>
            <span className="text-[11px] text-slate-500">
              Permanently wipe all recorded subscriptions, budgets, and user credentials.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              Delete Account & All Data?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action cannot be undone. All your mobile data purchase records, budgets, and Gemma history will be immediately wiped.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 cursor-pointer"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
