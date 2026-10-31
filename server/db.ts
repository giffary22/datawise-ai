import fs from 'node:fs';
import path from 'node:path';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
  currency: string; // e.g. "₦", "$", "£"
  primary_network: 'MTN' | 'Glo' | 'Airtel' | '9mobile';
  password_hash: string;
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
  network: 'MTN' | 'Glo' | 'Airtel' | '9mobile';
  bundle_size: string; // e.g. "1.5GB", "10GB", "20GB"
  bundle_mb: number; // normalized size in MB for math
  amount: number; // in user currency
  purchase_date: string; // ISO date string
  validity: string; // "1 day", "7 days", "14 days", "30 days", "custom"
  validity_days: number;
  expiry_date: string; // ISO date string
  description?: string;
  payment_method?: string; // "Bank Transfer", "USSD", "OPay", "PalmPay", "Airtime", "Debit Card"
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

interface DatabaseSchema {
  users: User[];
  subscriptions: Subscription[];
  budgets: Budget[];
  notifications: Notification[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'db.json');

// Helper to seed realistic Nigerian telco spending data for demo user
function generateDemoData(): DatabaseSchema {
  const demoUserId = 'user_demo_01';
  const now = new Date();
  
  // Create relative dates
  const daysAgo = (d: number, hour = 14) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(hour, 15, 0, 0);
    return date.toISOString();
  };

  const daysAhead = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    date.setHours(23, 59, 59, 0);
    return date.toISOString();
  };

  const demoUser: User = {
    id: demoUserId,
    full_name: 'Adedayo Ayomide',
    email: 'adedayogafarayomide@gmail.com',
    phone_number: '+234 803 456 7890',
    profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currency: '₦',
    primary_network: 'MTN',
    password_hash: 'demo_password_hash_123',
    onboarded: true,
    theme: 'light',
    created_at: daysAgo(60),
    settings: {
      email_notifications: true,
      budget_alerts: true,
      expiry_reminders: true,
      ai_weekly_digest: true,
      ai_tone: 'smart'
    }
  };

  const subscriptions: Subscription[] = [
    {
      id: 'sub_001',
      user_id: demoUserId,
      network: 'MTN',
      bundle_size: '20GB',
      bundle_mb: 20480,
      amount: 5000,
      purchase_date: daysAgo(2),
      validity: '30 days',
      validity_days: 30,
      expiry_date: daysAhead(28),
      description: 'Home Mifi & Remote Zoom calls',
      payment_method: 'OPay',
      created_at: daysAgo(2)
    },
    {
      id: 'sub_002',
      user_id: demoUserId,
      network: 'Airtel',
      bundle_size: '5GB',
      bundle_mb: 5120,
      amount: 2000,
      purchase_date: daysAgo(5),
      validity: '7 days',
      validity_days: 7,
      expiry_date: daysAhead(2),
      description: 'Secondary SIM data for commute streaming',
      payment_method: 'Bank Transfer',
      created_at: daysAgo(5)
    },
    {
      id: 'sub_003',
      user_id: demoUserId,
      network: 'Glo',
      bundle_size: '10GB',
      bundle_mb: 10240,
      amount: 3000,
      purchase_date: daysAgo(12),
      validity: '30 days',
      validity_days: 30,
      expiry_date: daysAhead(18),
      description: 'Heavy downloads & software updates',
      payment_method: 'PalmPay',
      created_at: daysAgo(12)
    },
    {
      id: 'sub_004',
      user_id: demoUserId,
      network: 'MTN',
      bundle_size: '4.5GB',
      bundle_mb: 4608,
      amount: 2000,
      purchase_date: daysAgo(18),
      validity: '30 days',
      validity_days: 30,
      expiry_date: daysAhead(12),
      description: 'Primary phone mobile data top-up',
      payment_method: 'USSD',
      created_at: daysAgo(18)
    },
    {
      id: 'sub_005',
      user_id: demoUserId,
      network: '9mobile',
      bundle_size: '2GB',
      bundle_mb: 2048,
      amount: 1200,
      purchase_date: daysAgo(25),
      validity: '30 days',
      validity_days: 30,
      expiry_date: daysAhead(5),
      description: 'Office backup internet connection',
      payment_method: 'Debit Card',
      created_at: daysAgo(25)
    },
    {
      id: 'sub_006',
      user_id: demoUserId,
      network: 'MTN',
      bundle_size: '15GB',
      bundle_mb: 15360,
      amount: 4500,
      purchase_date: daysAgo(36),
      validity: '30 days',
      validity_days: 30,
      expiry_date: daysAgo(6),
      description: 'Previous month main monthly bundle',
      payment_method: 'OPay',
      created_at: daysAgo(36)
    },
    {
      id: 'sub_007',
      user_id: demoUserId,
      network: 'Airtel',
      bundle_size: '3GB',
      bundle_mb: 3072,
      amount: 1500,
      purchase_date: daysAgo(42),
      validity: '7 days',
      validity_days: 7,
      expiry_date: daysAgo(35),
      description: 'Weekend emergency hotspot data',
      payment_method: 'Airtime',
      created_at: daysAgo(42)
    },
    {
      id: 'sub_008',
      user_id: demoUserId,
      network: 'Glo',
      bundle_size: '7GB',
      bundle_mb: 7168,
      amount: 2500,
      purchase_date: daysAgo(52),
      validity: '30 days',
      validity_days: 30,
      expiry_date: daysAgo(22),
      description: 'Glo Special Data offer',
      payment_method: 'Bank Transfer',
      created_at: daysAgo(52)
    }
  ];

  const budgets: Budget[] = [
    {
      id: 'bgt_001',
      user_id: demoUserId,
      budget_type: 'weekly',
      budget_amount: 8000,
      created_at: daysAgo(45),
      updated_at: daysAgo(5)
    },
    {
      id: 'bgt_002',
      user_id: demoUserId,
      budget_type: 'monthly',
      budget_amount: 25000,
      created_at: daysAgo(45),
      updated_at: daysAgo(10)
    },
    {
      id: 'bgt_003',
      user_id: demoUserId,
      budget_type: 'yearly',
      budget_amount: 280000,
      created_at: daysAgo(45),
      updated_at: daysAgo(10)
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_001',
      user_id: demoUserId,
      title: 'Airtel 5GB Bundle Expiring Soon',
      message: 'Your Airtel 5GB data subscription expires in 2 days. Consider renewing or switching to Glo off-peak to save.',
      notification_type: 'expiry_reminder',
      is_read: false,
      created_at: daysAgo(0, 10)
    },
    {
      id: 'notif_002',
      user_id: demoUserId,
      title: 'Monthly Budget Health: 52.8% Used',
      message: 'You have spent ₦13,200 out of your ₦25,000 monthly budget. You are on track for the month!',
      notification_type: 'budget_alert',
      is_read: false,
      created_at: daysAgo(1, 9)
    },
    {
      id: 'notif_003',
      user_id: demoUserId,
      title: 'Gemma AI Money-Saving Insight',
      message: 'You purchased 2 short-validity bundles this month. Bundling into MTN 20GB monthly saves you ₦2,200.',
      notification_type: 'ai_tip',
      is_read: true,
      created_at: daysAgo(3, 14)
    },
    {
      id: 'notif_004',
      user_id: demoUserId,
      title: 'Weekly Spending Summary',
      message: 'Last week you spent ₦7,000 on data across MTN and Airtel. That is 15% lower than the previous week.',
      notification_type: 'weekly_summary',
      is_read: true,
      created_at: daysAgo(6, 8)
    }
  ];

  return {
    users: [demoUser],
    subscriptions,
    budgets,
    notifications
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = { users: [], subscriptions: [], budgets: [], notifications: [] };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure default demo user exists if empty
        if (!this.data.users || this.data.users.length === 0) {
          this.data = generateDemoData();
          this.save();
        }
      } else {
        this.data = generateDemoData();
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database file, falling back to in-memory demo:', err);
      this.data = generateDemoData();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  // --- Users ---
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByPhone(phone: string): User | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    return this.data.users.find(u => u.phone_number.replace(/[^0-9]/g, '') === clean);
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: User): User {
    this.data.users.push(user);
    // Initialize default budgets
    const now = new Date().toISOString();
    this.data.budgets.push(
      { id: 'bgt_' + Date.now() + '_1', user_id: user.id, budget_type: 'weekly', budget_amount: 5000, created_at: now, updated_at: now },
      { id: 'bgt_' + Date.now() + '_2', user_id: user.id, budget_type: 'monthly', budget_amount: 20000, created_at: now, updated_at: now },
      { id: 'bgt_' + Date.now() + '_3', user_id: user.id, budget_type: 'yearly', budget_amount: 240000, created_at: now, updated_at: now }
    );
    // Welcome notification
    this.data.notifications.push({
      id: 'notif_' + Date.now(),
      user_id: user.id,
      title: 'Welcome to DataWise AI! 🇳🇬',
      message: 'Start tracking your mobile data subscriptions and let Google Gemma AI help you optimize your spend.',
      notification_type: 'system',
      is_read: false,
      created_at: now
    });
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  deleteUser(id: string): boolean {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.subscriptions = this.data.subscriptions.filter(s => s.user_id !== id);
    this.data.budgets = this.data.budgets.filter(b => b.user_id !== id);
    this.data.notifications = this.data.notifications.filter(n => n.user_id !== id);
    this.save();
    return true;
  }

  // --- Subscriptions ---
  getSubscriptions(userId: string): Subscription[] {
    return this.data.subscriptions
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
  }

  addSubscription(sub: Subscription): Subscription {
    this.data.subscriptions.push(sub);
    this.checkBudgetTriggers(sub.user_id);
    this.save();
    return sub;
  }

  updateSubscription(id: string, userId: string, updates: Partial<Subscription>): Subscription | undefined {
    const idx = this.data.subscriptions.findIndex(s => s.id === id && s.user_id === userId);
    if (idx === -1) return undefined;
    this.data.subscriptions[idx] = { ...this.data.subscriptions[idx], ...updates };
    this.checkBudgetTriggers(userId);
    this.save();
    return this.data.subscriptions[idx];
  }

  deleteSubscription(id: string, userId: string): boolean {
    const initLen = this.data.subscriptions.length;
    this.data.subscriptions = this.data.subscriptions.filter(s => !(s.id === id && s.user_id === userId));
    const deleted = this.data.subscriptions.length !== initLen;
    if (deleted) this.save();
    return deleted;
  }

  // --- Budgets ---
  getBudgets(userId: string): Budget[] {
    return this.data.budgets.filter(b => b.user_id === userId);
  }

  setBudget(userId: string, budgetType: 'weekly' | 'monthly' | 'yearly', amount: number): Budget {
    const existing = this.data.budgets.find(b => b.user_id === userId && b.budget_type === budgetType);
    const now = new Date().toISOString();
    if (existing) {
      existing.budget_amount = amount;
      existing.updated_at = now;
      this.save();
      return existing;
    } else {
      const newBudget: Budget = {
        id: 'bgt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        user_id: userId,
        budget_type: budgetType,
        budget_amount: amount,
        created_at: now,
        updated_at: now
      };
      this.data.budgets.push(newBudget);
      this.save();
      return newBudget;
    }
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addNotification(notif: Omit<Notification, 'id' | 'created_at'>): Notification {
    const full: Notification = {
      ...notif,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(full);
    this.save();
    return full;
  }

  markNotificationRead(id: string, userId: string): boolean {
    const item = this.data.notifications.find(n => n.id === id && n.user_id === userId);
    if (item) {
      item.is_read = true;
      this.save();
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): boolean {
    this.data.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.save();
    return true;
  }

  deleteNotification(id: string, userId: string): boolean {
    const before = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter(n => !(n.id === id && n.user_id === userId));
    const deleted = this.data.notifications.length !== before;
    if (deleted) this.save();
    return deleted;
  }

  // Budget trigger check
  private checkBudgetTriggers(userId: string) {
    const stats = this.getSpendingCalculations(userId);
    const user = this.findUserById(userId);
    const sym = user?.currency || '₦';

    const monthlyBudget = this.data.budgets.find(b => b.user_id === userId && b.budget_type === 'monthly')?.budget_amount || 0;
    if (monthlyBudget > 0) {
      const pct = (stats.monthlySpent / monthlyBudget) * 100;
      if (pct >= 100) {
        this.addNotification({
          user_id: userId,
          title: '🚨 Monthly Budget Exceeded!',
          message: `You have spent ${sym}${stats.monthlySpent.toLocaleString()} (${pct.toFixed(0)}%) of your ${sym}${monthlyBudget.toLocaleString()} monthly budget.`,
          notification_type: 'budget_alert',
          is_read: false
        });
      } else if (pct >= 90) {
        this.addNotification({
          user_id: userId,
          title: '⚠️ 90% of Monthly Budget Reached',
          message: `You have reached ${pct.toFixed(0)}% of your monthly limit (${sym}${stats.monthlySpent.toLocaleString()} of ${sym}${monthlyBudget.toLocaleString()}).`,
          notification_type: 'budget_alert',
          is_read: false
        });
      } else if (pct >= 75) {
        this.addNotification({
          user_id: userId,
          title: '🔔 75% Budget Warning',
          message: `You have consumed 75% of your monthly data budget. ${sym}${(monthlyBudget - stats.monthlySpent).toLocaleString()} remaining.`,
          notification_type: 'budget_alert',
          is_read: false
        });
      }
    }
  }

  // Exact calculations for user
  getSpendingCalculations(userId: string) {
    const subs = this.getSubscriptions(userId);
    const now = new Date();

    // Start of this week (Sunday or Monday, let's use Monday 00:00:00)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setMilliseconds(-1);

    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Start of this year
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const startOfPrevYear = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    const endOfPrevYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

    let weeklySpent = 0;
    let lastWeekSpent = 0;
    let monthlySpent = 0;
    let prevMonthSpent = 0;
    let yearlySpent = 0;
    let prevYearSpent = 0;

    const networkBreakdown: Record<'MTN' | 'Glo' | 'Airtel' | '9mobile', { total: number; count: number; recent?: Subscription }> = {
      MTN: { total: 0, count: 0 },
      Glo: { total: 0, count: 0 },
      Airtel: { total: 0, count: 0 },
      '9mobile': { total: 0, count: 0 }
    };

    const bundleSizesCount: Record<string, number> = {};

    for (const s of subs) {
      const pDate = new Date(s.purchase_date);
      const amt = Number(s.amount) || 0;

      // Weekly
      if (pDate >= startOfWeek && pDate <= now) {
        weeklySpent += amt;
      } else if (pDate >= startOfLastWeek && pDate <= endOfLastWeek) {
        lastWeekSpent += amt;
      }

      // Monthly
      if (pDate >= startOfMonth && pDate <= now) {
        monthlySpent += amt;
      } else if (pDate >= startOfPrevMonth && pDate <= endOfPrevMonth) {
        prevMonthSpent += amt;
      }

      // Yearly
      if (pDate >= startOfYear && pDate <= now) {
        yearlySpent += amt;
      } else if (pDate >= startOfPrevYear && pDate <= endOfPrevYear) {
        prevYearSpent += amt;
      }

      // Network
      if (networkBreakdown[s.network]) {
        networkBreakdown[s.network].total += amt;
        networkBreakdown[s.network].count += 1;
        if (!networkBreakdown[s.network].recent) {
          networkBreakdown[s.network].recent = s;
        }
      }

      // Bundle frequency
      bundleSizesCount[s.bundle_size] = (bundleSizesCount[s.bundle_size] || 0) + 1;
    }

    // % changes
    const weeklyPctChange = lastWeekSpent > 0
      ? ((weeklySpent - lastWeekSpent) / lastWeekSpent) * 100
      : weeklySpent > 0 ? 100 : 0;

    const monthlyPctChange = prevMonthSpent > 0
      ? ((monthlySpent - prevMonthSpent) / prevMonthSpent) * 100
      : monthlySpent > 0 ? 100 : 0;

    const yearlyPctChange = prevYearSpent > 0
      ? ((yearlySpent - prevYearSpent) / prevYearSpent) * 100
      : yearlySpent > 0 ? 100 : 0;

    // Most expensive network
    let mostExpensiveNetwork: 'MTN' | 'Glo' | 'Airtel' | '9mobile' = 'MTN';
    let maxNetworkSpend = -1;
    (Object.keys(networkBreakdown) as Array<'MTN' | 'Glo' | 'Airtel' | '9mobile'>).forEach(net => {
      if (networkBreakdown[net].total > maxNetworkSpend) {
        maxNetworkSpend = networkBreakdown[net].total;
        mostExpensiveNetwork = net;
      }
    });

    // Most frequent bundle
    let mostFrequentBundle = 'None';
    let maxBundleCount = 0;
    Object.entries(bundleSizesCount).forEach(([bundle, cnt]) => {
      if (cnt > maxBundleCount) {
        maxBundleCount = cnt;
        mostFrequentBundle = bundle;
      }
    });

    return {
      weeklySpent,
      lastWeekSpent,
      weeklyPctChange,
      monthlySpent,
      prevMonthSpent,
      monthlyPctChange,
      yearlySpent,
      prevYearSpent,
      yearlyPctChange,
      totalSubscriptionsCount: subs.length,
      networkBreakdown,
      mostExpensiveNetwork,
      mostFrequentBundle
    };
  }
}

export const db = new DatabaseManager();
