import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { db, User, Subscription } from './server/db';
import { askGemmaAssistant, generateSavingsInsights } from './server/ai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Simple session/token middleware using headers or cookies
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let userId = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7);
  } else if (req.query.user_id) {
    userId = String(req.query.user_id);
  }

  // Fallback to default demo user if not passed, but allow explicit auth
  if (!userId) {
    // If there is any user, pick the first user as fallback for seamless experience
    const demoUser = db.findUserById('user_demo_01');
    if (demoUser) {
      (req as any).user = demoUser;
      return next();
    }
  }

  const user = db.findUserById(userId);
  if (!user) {
    // If invalid token, fallback to demo if exists, or 401
    const fallback = db.findUserById('user_demo_01');
    if (fallback) {
      (req as any).user = fallback;
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  (req as any).user = user;
  next();
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { full_name, email, phone_number, password, currency, primary_network } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone_number: (phone_number || '').trim(),
    currency: currency || '₦',
    primary_network: primary_network || 'MTN',
    password_hash: 'hash_' + password,
    onboarded: false,
    theme: 'light',
    created_at: new Date().toISOString(),
    settings: {
      email_notifications: true,
      budget_alerts: true,
      expiry_reminders: true,
      ai_weekly_digest: true,
      ai_tone: 'smart',
    },
  };

  const created = db.createUser(newUser);
  res.status(201).json({
    user: created,
    token: created.id,
    message: 'Account created successfully.',
  });
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required.' });
  }

  let user = db.findUserByEmail(identifier);
  if (!user) {
    user = db.findUserByPhone(identifier);
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  // Accept password if matched or for demo simplicity
  if (user.password_hash !== 'hash_' + password && user.password_hash !== 'demo_password_hash_123' && password !== 'password123') {
    return res.status(401).json({ error: 'Invalid password.' });
  }

  res.json({
    user,
    token: user.id,
    message: 'Welcome back!',
  });
});

// Google One-Click Simulated Sign-in
app.post('/api/auth/google', (req: Request, res: Response) => {
  const { email, name, avatar } = req.body;
  const targetEmail = email || 'adedayogafarayomide@gmail.com';
  let user = db.findUserByEmail(targetEmail);

  if (!user) {
    user = db.createUser({
      id: 'user_google_' + Date.now(),
      full_name: name || 'Google User',
      email: targetEmail,
      phone_number: '+234 800 000 0000',
      profile_picture: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      currency: '₦',
      primary_network: 'MTN',
      password_hash: 'google_oauth_verified',
      onboarded: true,
      theme: 'light',
      created_at: new Date().toISOString(),
      settings: {
        email_notifications: true,
        budget_alerts: true,
        expiry_reminders: true,
        ai_weekly_digest: true,
        ai_tone: 'smart',
      },
    });
  }

  res.json({
    user,
    token: user.id,
    message: 'Google Sign-in successful.',
  });
});

// Complete Onboarding
app.post('/api/auth/onboarding', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { currency, primary_network, monthly_budget } = req.body;

  const updated = db.updateUser(user.id, {
    currency: currency || user.currency || '₦',
    primary_network: primary_network || user.primary_network || 'MTN',
    onboarded: true,
  });

  if (monthly_budget && Number(monthly_budget) > 0) {
    db.setBudget(user.id, 'monthly', Number(monthly_budget));
    // also set weekly to approx 25% of monthly
    db.setBudget(user.id, 'weekly', Math.round(Number(monthly_budget) / 4));
    db.setBudget(user.id, 'yearly', Math.round(Number(monthly_budget) * 12));
  }

  res.json({ user: updated, message: 'Onboarding completed!' });
});

// Get current user profile
app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  res.json({ user });
});

// Update Profile & Settings
app.post('/api/auth/profile', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { full_name, phone_number, currency, primary_network, profile_picture, theme, settings, new_password } = req.body;

  const updates: Partial<User> = {};
  if (full_name !== undefined) updates.full_name = full_name.trim();
  if (phone_number !== undefined) updates.phone_number = phone_number.trim();
  if (currency !== undefined) updates.currency = currency;
  if (primary_network !== undefined) updates.primary_network = primary_network;
  if (profile_picture !== undefined) updates.profile_picture = profile_picture;
  if (theme !== undefined) updates.theme = theme;
  if (settings !== undefined) updates.settings = { ...user.settings, ...settings };
  if (new_password) updates.password_hash = 'hash_' + new_password;

  const updated = db.updateUser(user.id, updates);
  res.json({ user: updated, message: 'Profile updated successfully.' });
});

// Switch to demo user (for convenience in reviewing app)
app.post('/api/auth/demo-switch', (req: Request, res: Response) => {
  const demoUser = db.findUserById('user_demo_01');
  if (demoUser) {
    res.json({ user: demoUser, token: demoUser.id, message: 'Switched to demo account.' });
  } else {
    res.status(404).json({ error: 'Demo account not found.' });
  }
});

// Delete account
app.delete('/api/account', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  db.deleteUser(user.id);
  res.json({ message: 'Account and all associated records permanently removed.' });
});

// ==================== SUBSCRIPTIONS ====================

app.get('/api/subscriptions', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const subs = db.getSubscriptions(user.id);
  res.json({ subscriptions: subs });
});

app.post('/api/subscriptions', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { network, bundle_size, amount, purchase_date, validity, description, payment_method } = req.body;

  if (!network || !bundle_size || amount === undefined) {
    return res.status(400).json({ error: 'Network, bundle size, and amount are required.' });
  }

  // Calculate validity days and expiry
  let days = 30;
  const vLower = (validity || '30 days').toLowerCase();
  if (vLower.includes('1 day') || vLower === '1') days = 1;
  else if (vLower.includes('2 day')) days = 2;
  else if (vLower.includes('7 day')) days = 7;
  else if (vLower.includes('14 day')) days = 14;
  else if (vLower.includes('60 day')) days = 60;
  else if (vLower.includes('custom') && req.body.custom_days) days = Number(req.body.custom_days) || 30;

  const pDate = purchase_date ? new Date(purchase_date) : new Date();
  const expDate = new Date(pDate);
  expDate.setDate(expDate.getDate() + days);

  // Compute bundle in MB for calculations
  let mb = 1000;
  const bUpper = bundle_size.toUpperCase();
  if (bUpper.includes('GB')) {
    const num = parseFloat(bUpper.replace(/[^0-9.]/g, '')) || 1;
    mb = Math.round(num * 1024);
  } else if (bUpper.includes('MB')) {
    mb = parseFloat(bUpper.replace(/[^0-9.]/g, '')) || 500;
  }

  const newSub: Subscription = {
    id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    user_id: user.id,
    network,
    bundle_size,
    bundle_mb: mb,
    amount: Number(amount),
    purchase_date: pDate.toISOString(),
    validity: validity || `${days} days`,
    validity_days: days,
    expiry_date: expDate.toISOString(),
    description: description || '',
    payment_method: payment_method || 'Bank Transfer',
    created_at: new Date().toISOString(),
  };

  const saved = db.addSubscription(newSub);
  res.status(201).json({ subscription: saved, message: 'Subscription saved successfully.' });
});

app.put('/api/subscriptions/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const updates = req.body;

  if (updates.validity && updates.purchase_date) {
    let days = 30;
    const vLower = String(updates.validity).toLowerCase();
    if (vLower.includes('1 day')) days = 1;
    else if (vLower.includes('7 day')) days = 7;
    else if (vLower.includes('14 day')) days = 14;
    else if (vLower.includes('60 day')) days = 60;
    const pDate = new Date(updates.purchase_date);
    const expDate = new Date(pDate);
    expDate.setDate(expDate.getDate() + days);
    updates.validity_days = days;
    updates.expiry_date = expDate.toISOString();
  }

  if (updates.amount) updates.amount = Number(updates.amount);

  const updated = db.updateSubscription(id, user.id, updates);
  if (!updated) return res.status(404).json({ error: 'Subscription not found.' });
  res.json({ subscription: updated, message: 'Subscription updated.' });
});

app.delete('/api/subscriptions/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const deleted = db.deleteSubscription(id, user.id);
  if (!deleted) return res.status(404).json({ error: 'Subscription not found.' });
  res.json({ message: 'Subscription deleted.' });
});

// ==================== BUDGETS ====================

app.get('/api/budgets', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const budgets = db.getBudgets(user.id);
  res.json({ budgets });
});

app.post('/api/budgets', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { budget_type, budget_amount } = req.body;

  if (!budget_type || budget_amount === undefined) {
    return res.status(400).json({ error: 'budget_type and budget_amount are required.' });
  }

  const updated = db.setBudget(user.id, budget_type, Number(budget_amount));
  res.json({ budget: updated, message: 'Budget updated successfully.' });
});

// ==================== ANALYTICS & DASHBOARD ====================

app.get('/api/analytics', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const stats = db.getSpendingCalculations(user.id);
  const budgets = db.getBudgets(user.id);
  const subscriptions = db.getSubscriptions(user.id);

  // Daily spend timeline for charts (last 30 days)
  const last30Days: Record<string, { date: string; amount: number; mtn: number; glo: number; airtel: number; nineMobile: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    last30Days[key] = { date: key, amount: 0, mtn: 0, glo: 0, airtel: 0, nineMobile: 0 };
  }

  // Monthly timeline for current year
  const monthlyTimeline = [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: 0 },
    { month: 'May', amount: 0 },
    { month: 'Jun', amount: 0 },
    { month: 'Jul', amount: 0 },
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 0 },
    { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 0 },
    { month: 'Dec', amount: 0 },
  ];

  subscriptions.forEach((s) => {
    const dt = s.purchase_date.split('T')[0];
    if (last30Days[dt]) {
      last30Days[dt].amount += s.amount;
      if (s.network === 'MTN') last30Days[dt].mtn += s.amount;
      else if (s.network === 'Glo') last30Days[dt].glo += s.amount;
      else if (s.network === 'Airtel') last30Days[dt].airtel += s.amount;
      else if (s.network === '9mobile') last30Days[dt].nineMobile += s.amount;
    }

    const subYear = new Date(s.purchase_date).getFullYear();
    const currentYear = new Date().getFullYear();
    if (subYear === currentYear) {
      const mIdx = new Date(s.purchase_date).getMonth();
      if (monthlyTimeline[mIdx]) {
        monthlyTimeline[mIdx].amount += s.amount;
      }
    }
  });

  res.json({
    stats,
    budgets,
    dailyTimeline: Object.values(last30Days),
    monthlyTimeline,
  });
});

// ==================== NOTIFICATIONS ====================

app.get('/api/notifications', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const list = db.getNotifications(user.id);
  res.json({ notifications: list });
});

app.put('/api/notifications/:id/read', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ok = db.markNotificationRead(req.params.id, user.id);
  res.json({ success: ok });
});

app.put('/api/notifications/read-all', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  db.markAllNotificationsRead(user.id);
  res.json({ success: true });
});

app.delete('/api/notifications/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const ok = db.deleteNotification(req.params.id, user.id);
  res.json({ success: ok });
});

// ==================== AI ASSISTANT & INSIGHTS ====================

app.post('/api/ai/chat', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const reply = await askGemmaAssistant(user.id, message, history || []);
    res.json({ reply });
  } catch (err: any) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ error: 'Failed to process AI response: ' + (err?.message || 'Unknown error') });
  }
});

app.get('/api/ai/insights', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  try {
    const insights = await generateSavingsInsights(user.id);
    res.json({ insights });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate insights.' });
  }
});

// ==================== EXPORT DATA ====================

app.get('/api/export', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const format = req.query.format === 'csv' ? 'csv' : 'json';
  const subs = db.getSubscriptions(user.id);
  const stats = db.getSpendingCalculations(user.id);

  if (format === 'csv') {
    const headers = 'ID,Network,BundleSize,Amount,PurchaseDate,Validity,ExpiryDate,PaymentMethod,Description\n';
    const rows = subs.map((s) =>
      `"${s.id}","${s.network}","${s.bundle_size}",${s.amount},"${s.purchase_date}","${s.validity}","${s.expiry_date}","${s.payment_method || ''}","${(s.description || '').replace(/"/g, '""')}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=datawise-subscriptions-${user.full_name.replace(/\s+/g, '_')}.csv`);
    return res.send(headers + rows);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=datawise-export-${user.id}.json`);
  res.json({
    user: {
      name: user.full_name,
      email: user.email,
      phone: user.phone_number,
      currency: user.currency,
    },
    exportDate: new Date().toISOString(),
    stats,
    subscriptions: subs,
  });
});

// ==================== VITE & STATIC FILES ====================

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DataWise AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
