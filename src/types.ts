export type NetworkType = 'MTN' | 'Glo' | 'Airtel' | '9mobile';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
  currency: string;
  primary_network: NetworkType;
  onboarded: boolean;
  theme: 'light' | 'dark' | 'system';
  created_at: string;
  settings?: {
    email_notifications: boolean;
    budget_alerts: boolean;
    expiry_reminders: boolean;
    ai_weekly_digest: boolean;
    ai_tone: 'frugal' | 'balanced' | 'smart';
  };
}

export interface Subscription {
  id: string;
  user_id: string;
  network: NetworkType;
  bundle_size: string;
  bundle_mb: number;
  amount: number;
  purchase_date: string;
  validity: string;
  validity_days: number;
  expiry_date: string;
  description?: string;
  payment_method?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  budget_type: 'weekly' | 'monthly' | 'yearly';
  budget_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'budget_alert' | 'expiry_reminder' | 'spending_spike' | 'weekly_summary' | 'ai_tip' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface SpendingStats {
  weeklySpent: number;
  lastWeekSpent: number;
  weeklyPctChange: number;
  monthlySpent: number;
  prevMonthSpent: number;
  monthlyPctChange: number;
  yearlySpent: number;
  prevYearSpent: number;
  yearlyPctChange: number;
  totalSubscriptionsCount: number;
  networkBreakdown: Record<NetworkType, {
    total: number;
    count: number;
    recent?: Subscription;
  }>;
  mostExpensiveNetwork: NetworkType;
  mostFrequentBundle: string;
}

export interface AnalyticsData {
  stats: SpendingStats;
  budgets: Budget[];
  dailyTimeline: Array<{
    date: string;
    amount: number;
    mtn: number;
    glo: number;
    airtel: number;
    nineMobile: number;
  }>;
  monthlyTimeline: Array<{
    month: string;
    amount: number;
  }>;
}

export interface AiInsight {
  id: string;
  title: string;
  impact: string;
  savingsEst: string;
  badge: string;
  description: string;
  actionLabel: string;
}
