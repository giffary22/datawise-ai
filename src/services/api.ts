import { User, Subscription, Budget, Notification, AnalyticsData, AiInsight } from '../types';

const TOKEN_KEY = 'datawise_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || 'user_demo_01';
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMessage = 'Request failed';
    try {
      const errData = await response.json();
      errMessage = errData.error || errMessage;
    } catch {
      errMessage = `HTTP error ${response.status}`;
    }
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: User }> {
    return fetchWithAuth('/api/auth/me');
  },

  async register(data: {
    full_name: string;
    email: string;
    phone_number?: string;
    password: string;
    currency?: string;
    primary_network?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(data: { identifier: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async googleLogin(data: { email?: string; name?: string; avatar?: string }): Promise<{ user: User; token: string }> {
    const res = await fetchWithAuth('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async switchDemo(): Promise<{ user: User; token: string }> {
    const res = await fetchWithAuth('/api/auth/demo-switch', {
      method: 'POST',
    });
    setStoredToken(res.token);
    return res;
  },

  async updateProfile(updates: Partial<User> & { new_password?: string }): Promise<{ user: User }> {
    return fetchWithAuth('/api/auth/profile', {
      method: 'POST',
      body: JSON.stringify(updates),
    });
  },

  async completeOnboarding(data: {
    currency: string;
    primary_network: string;
    monthly_budget: number;
  }): Promise<{ user: User }> {
    return fetchWithAuth('/api/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteAccount(): Promise<void> {
    await fetchWithAuth('/api/account', { method: 'DELETE' });
    setStoredToken(null);
  },

  // Subscriptions
  async getSubscriptions(): Promise<{ subscriptions: Subscription[] }> {
    return fetchWithAuth('/api/subscriptions');
  },

  async addSubscription(data: Partial<Subscription>): Promise<{ subscription: Subscription }> {
    return fetchWithAuth('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<{ subscription: Subscription }> {
    return fetchWithAuth(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteSubscription(id: string): Promise<void> {
    return fetchWithAuth(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    });
  },

  // Budgets
  async getBudgets(): Promise<{ budgets: Budget[] }> {
    return fetchWithAuth('/api/budgets');
  },

  async setBudget(budget_type: 'weekly' | 'monthly' | 'yearly', budget_amount: number): Promise<{ budget: Budget }> {
    return fetchWithAuth('/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ budget_type, budget_amount }),
    });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return fetchWithAuth('/api/analytics');
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[] }> {
    return fetchWithAuth('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<void> {
    return fetchWithAuth(`/api/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllNotificationsRead(): Promise<void> {
    return fetchWithAuth('/api/notifications/read-all', { method: 'PUT' });
  },

  async deleteNotification(id: string): Promise<void> {
    return fetchWithAuth(`/api/notifications/${id}`, { method: 'DELETE' });
  },

  // AI
  async chatWithGemma(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<{ reply: string }> {
    return fetchWithAuth('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },

  async getAiInsights(): Promise<{ insights: AiInsight[] }> {
    return fetchWithAuth('/api/ai/insights');
  },

  // Export
  getExportUrl(format: 'csv' | 'json'): string {
    const token = getStoredToken();
    return `/api/export?format=${format}&user_id=${token || 'user_demo_01'}`;
  },
};
