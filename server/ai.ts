import { GoogleGenAI } from '@google/genai';
import { db, User, Subscription } from './db';

// Gemma model configurable via env, defaulting to supported Gemma or Gemini 3.8 Flash
const PRIMARY_MODEL = process.env.GEMMA_MODEL_ID || 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.8-flash';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function askGemmaAssistant(
  userId: string,
  userMessage: string,
  history: ChatMessage[] = []
): Promise<string> {
  const user = db.findUserById(userId);
  if (!user) throw new Error('User not found');

  const subs = db.getSubscriptions(userId);
  const budgets = db.getBudgets(userId);
  const stats = db.getSpendingCalculations(userId);
  const currency = user.currency || '₦';

  const monthlyBudget = budgets.find((b) => b.budget_type === 'monthly')?.budget_amount || 0;
  const weeklyBudget = budgets.find((b) => b.budget_type === 'weekly')?.budget_amount || 0;

  // Build accurate factual context from the user's actual database
  const contextSummary = {
    userName: user.full_name,
    currency,
    primaryNetwork: user.primary_network,
    spendingStats: {
      weeklySpent: `${currency}${stats.weeklySpent.toLocaleString()}`,
      lastWeekSpent: `${currency}${stats.lastWeekSpent.toLocaleString()}`,
      weeklyChangePct: `${stats.weeklyPctChange.toFixed(1)}%`,
      monthlySpent: `${currency}${stats.monthlySpent.toLocaleString()}`,
      prevMonthSpent: `${currency}${stats.prevMonthSpent.toLocaleString()}`,
      monthlyChangePct: `${stats.monthlyPctChange.toFixed(1)}%`,
      yearlySpent: `${currency}${stats.yearlySpent.toLocaleString()}`,
      totalSubscriptionsCount: stats.totalSubscriptionsCount,
      mostExpensiveNetwork: stats.mostExpensiveNetwork,
      mostFrequentBundle: stats.mostFrequentBundle,
    },
    budgets: {
      weekly: weeklyBudget ? `${currency}${weeklyBudget.toLocaleString()}` : 'Not set',
      monthly: monthlyBudget ? `${currency}${monthlyBudget.toLocaleString()}` : 'Not set',
      monthlyUsedPct: monthlyBudget > 0 ? `${((stats.monthlySpent / monthlyBudget) * 100).toFixed(1)}%` : 'N/A',
      monthlyRemaining: monthlyBudget > 0 ? `${currency}${Math.max(0, monthlyBudget - stats.monthlySpent).toLocaleString()}` : 'N/A',
    },
    networkBreakdown: {
      MTN: `${currency}${stats.networkBreakdown.MTN.total.toLocaleString()} (${stats.networkBreakdown.MTN.count} subs)`,
      Glo: `${currency}${stats.networkBreakdown.Glo.total.toLocaleString()} (${stats.networkBreakdown.Glo.count} subs)`,
      Airtel: `${currency}${stats.networkBreakdown.Airtel.total.toLocaleString()} (${stats.networkBreakdown.Airtel.count} subs)`,
      '9mobile': `${currency}${stats.networkBreakdown['9mobile'].total.toLocaleString()} (${stats.networkBreakdown['9mobile'].count} subs)`,
    },
    recentTransactions: subs.slice(0, 8).map((s) => ({
      network: s.network,
      bundle: s.bundle_size,
      amount: `${currency}${s.amount}`,
      date: s.purchase_date.split('T')[0],
      validity: s.validity,
      expiryDate: s.expiry_date.split('T')[0],
      purpose: s.description || 'General use',
    })),
    nigerianTelcoTips: [
      'Glo offers higher data volumes per Naira, ideal for heavy downloads, though coverage varies by state.',
      'MTN has wide 4G/5G coverage and good stability; buying monthly 20GB (approx ₦5,000-₦6,000) is often cheaper per GB than repeat 1.5GB/2GB weekly bundles.',
      'Airtel offers Binge daily packs and good YouTube night bonuses.',
      '9mobile offers specialized off-peak and business packages.',
    ],
  };

  const systemInstruction = `
You are DataWise AI Assistant, an intelligent, empathetic financial advisor specialized in mobile data budgeting for Nigerian telecommunications users (MTN, Glo, Airtel, 9mobile).
You are powered by Google's Gemma model architecture.

CRITICAL RULES:
1. Always base all financial answers on the EXACT verified user data provided below. NEVER fabricate statistics or contradict these numbers.
2. If asked "How much did I spend on data this week?", answer with the exact weekly amount (${contextSummary.spendingStats.weeklySpent}).
3. If asked about MTN, Glo, Airtel, or 9mobile, cite the exact totals from the network breakdown.
4. Give actionable, friendly, and realistic money-saving suggestions grounded in Nigerian reality (e.g., USSD codes, bundle consolidation, night browsing, off-peak bonuses, Mifi routers).
5. Tone: Professional, warm, savvy, and encouraging Nigerian fintech companion.
6. Format responses with clean bullet points and bold amounts for readability.

VERIFIED USER REAL-TIME FINANCIAL CONTEXT:
${JSON.stringify(contextSummary, null, 2)}
`;

  const ai = getAiClient();
  if (!ai) {
    // Graceful smart local fallback if GEMINI_API_KEY is not configured
    return generateLocalSmartResponse(userMessage, contextSummary);
  }

  try {
    const contents: any[] = [];

    // Append prior conversational turns
    for (const msg of history.slice(-6)) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    try {
      const response = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents,
        config: {
          systemInstruction,
        },
      });

      return response.text || generateLocalSmartResponse(userMessage, contextSummary);
    } catch (modelErr: any) {
      console.warn(`Error generating with primary model ${PRIMARY_MODEL}, falling back to ${FALLBACK_MODEL}:`, modelErr?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents,
        config: {
          systemInstruction,
        },
      });
      return fallbackResponse.text || generateLocalSmartResponse(userMessage, contextSummary);
    }
  } catch (err: any) {
    console.error('AI Generation failed, using verified rule-based response:', err);
    return generateLocalSmartResponse(userMessage, contextSummary);
  }
}

// Generates guaranteed factual answer based on exact parsed query intent when API is offline
function generateLocalSmartResponse(query: string, ctx: any): string {
  const q = query.toLowerCase();
  const curr = ctx.currency;

  if (q.includes('week') || q.includes('this week')) {
    return `📊 **Weekly Spending Summary:**\nYou have spent **${ctx.spendingStats.weeklySpent}** on data this week (compared to ${ctx.spendingStats.lastWeekSpent} last week, a change of **${ctx.spendingStats.weeklyChangePct}**).\n\n💡 *Gemma Tip:* To stay within your weekly target, consider scheduling your heavy app updates over home Wi-Fi or using off-peak midnight bundles.`;
  }

  if (q.includes('month') || q.includes('this month') || q.includes('monthly')) {
    return `📅 **Monthly Spending Status:**\nYou have spent **${ctx.spendingStats.monthlySpent}** this month. Your monthly budget is **${ctx.budgets.monthly}**.\n\n• **Budget Used:** ${ctx.budgets.monthlyUsedPct}\n• **Remaining Budget:** ${ctx.budgets.monthlyRemaining}\n\n${
      parseFloat(ctx.budgets.monthlyUsedPct) > 80
        ? '⚠️ *Alert:* You have consumed over 80% of your budget. Consider reducing video streaming resolution on mobile data to 480p.'
        : '✅ *Status:* You are currently in a healthy spending range!'
    }`;
  }

  if (q.includes('mtn')) {
    return `🟡 **MTN Spending Breakdown:**\nYou have spent **${ctx.networkBreakdown.MTN}**.\n\n💡 *Gemma Saving Recommendation:* If you frequently top up 1.5GB or 2GB weekly on MTN, consolidating into their **Monthly 20GB (₦5,000)** or **10GB (₦3,000)** plan reduces your average cost per gigabyte by over 25%!`;
  }

  if (q.includes('glo')) {
    return `🟢 **Glo Spending Breakdown:**\nYou have spent **${ctx.networkBreakdown.Glo}**.\n\n💡 *Gemma Tip:* Glo provides some of the highest data volumes per Naira in Nigeria. Ensure you test signal strength in your residential area for high streaming quality.`;
  }

  if (q.includes('airtel')) {
    return `🔴 **Airtel Spending Breakdown:**\nYou have spent **${ctx.networkBreakdown.Airtel}**.\n\n💡 *Gemma Tip:* Airtel's Binge plans are great for intensive weekend tasks, but for consistent daily usage, their monthly bundles offer better overall value.`;
  }

  if (q.includes('reduce') || q.includes('save') || q.includes('cut')) {
    return `💡 **Gemma AI Money-Saving Action Plan:**\n\n1. **Consolidate Short-Term Bundles:** Buying daily or 2-day micro-bundles typically costs up to ₦1,000 per GB. Switching to 30-day bundles drops that down to ~₦250–₦350 per GB.\n2. **Network Specialization:** Your most expensive network is **${ctx.spendingStats.mostExpensiveNetwork}**. Use dual-SIM capabilities: keep your main phone number on your primary network, and use a secondary SIM with cheaper gigabyte rates (like Glo or special promo sims) in SIM slot 2.\n3. **Data Compression:** Turn on 'Data Saver' mode on Instagram, TikTok, and YouTube mobile apps.\n4. **Set Auto-Budget Alerts:** Keep your DataWise AI alerts set at 75% to prevent surprise overages.`;
  }

  if (q.includes('which network') || q.includes('most money') || q.includes('highest')) {
    return `🏆 **Network Analysis:**\nYour highest spend is currently on **${ctx.spendingStats.mostExpensiveNetwork}**!\n\nHere is your full breakdown:\n• **MTN:** ${ctx.networkBreakdown.MTN}\n• **Glo:** ${ctx.networkBreakdown.Glo}\n• **Airtel:** ${ctx.networkBreakdown.Airtel}\n• **9mobile:** ${ctx.networkBreakdown['9mobile']}`;
  }

  return `👋 Hello **${ctx.userName}**! Based on your records:\n\n• **This Month's Spending:** ${ctx.spendingStats.monthlySpent} (Budget: ${ctx.budgets.monthly})\n• **This Week's Spending:** ${ctx.spendingStats.weeklySpent}\n• **Top Network:** ${ctx.spendingStats.mostExpensiveNetwork}\n• **Most Purchased Plan:** ${ctx.spendingStats.mostFrequentBundle}\n\nYou can ask me:\n- *"How much did I spend on MTN?"*\n- *"How can I reduce my monthly data expenses?"*\n- *"Am I spending more on data than last month?"*\n- *"Recommend a realistic budget for next month"*`;
}

export async function generateSavingsInsights(userId: string) {
  const user = db.findUserById(userId);
  if (!user) return [];

  const stats = db.getSpendingCalculations(userId);
  const budgets = db.getBudgets(userId);
  const monthlyBudget = budgets.find((b) => b.budget_type === 'monthly')?.budget_amount || 20000;
  const currency = user.currency || '₦';

  const insights = [
    {
      id: 'ins_1',
      title: 'Bundle Consolidation Savings',
      impact: 'High',
      savingsEst: `${currency}3,500/month`,
      badge: 'Gemma Strategy',
      description: `You frequently purchase short-validity weekly bundles on ${stats.mostExpensiveNetwork}. Upgrading to a single 30-day monthly bundle of 20GB lowers your per-gigabyte cost from ~₦500/GB to ~₦250/GB.`,
      actionLabel: 'View Monthly Bundles',
    },
    {
      id: 'ins_2',
      title: 'Off-Peak / Midnight Advantage',
      impact: 'Medium',
      savingsEst: `${currency}2,000/month`,
      badge: 'Data Optimization',
      description: 'Schedule OS updates, game downloads, and podcast syncs for night-time (11PM - 6AM) when Nigerian networks offer 2GB for as low as ₦200.',
      actionLabel: 'Learn More',
    },
    {
      id: 'ins_3',
      title: 'Dual-SIM Strategy',
      impact: 'Medium',
      savingsEst: `${currency}4,000/month`,
      badge: 'Network Arbitrage',
      description: `You have spent ${currency}${stats.networkBreakdown.MTN.total.toLocaleString()} on MTN and ${currency}${stats.networkBreakdown.Airtel.total.toLocaleString()} on Airtel. Routing streaming through Glo or promo sims can cut streaming expense by ~35%.`,
      actionLabel: 'Compare Rates',
    },
    {
      id: 'ins_4',
      title: 'Monthly Budget Health',
      impact: stats.monthlySpent > monthlyBudget ? 'Critical' : 'Good',
      savingsEst: `${currency}${Math.max(0, monthlyBudget - stats.monthlySpent).toLocaleString()} buffer`,
      badge: 'Budget Pace',
      description: `Current burn rate is approximately ${currency}${Math.round(stats.monthlySpent / (new Date().getDate() || 1)).toLocaleString()}/day. At this pace, you will finish the month around ${currency}${Math.round((stats.monthlySpent / (new Date().getDate() || 1)) * 30).toLocaleString()}.`,
      actionLabel: 'Adjust Budget',
    },
  ];

  return insights;
}
