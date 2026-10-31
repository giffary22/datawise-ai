import React, { useState, useEffect, useRef } from 'react';
import { SpendingStats, Subscription, Budget, AiInsight } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  TrendingDown,
  Zap,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface AiAssistantPageProps {
  stats: SpendingStats;
  subscriptions: Subscription[];
  budgets: Budget[];
  currency: string;
  onNavigate: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  stats,
  subscriptions,
  budgets,
  currency,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'recommendations'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome to DataWise AI Assistant!**\n\nI am powered by Google's Gemma model architecture with direct access to your verified Nigerian telecommunications data. Here is your current snapshot:\n\n• **Spent This Week:** ${currency}${stats.weeklySpent.toLocaleString()}\n• **Spent This Month:** ${currency}${stats.monthlySpent.toLocaleString()} (${budgets.find(b => b.budget_type === 'monthly')?.budget_amount ? `${((stats.monthlySpent / budgets.find(b => b.budget_type === 'monthly')!.budget_amount) * 100).toFixed(0)}% of limit` : 'No budget set'})\n• **Top Network:** ${stats.mostExpensiveNetwork} (${stats.networkBreakdown[stats.mostExpensiveNetwork].count} subscriptions)\n\nFeel free to tap any question below or ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sampleQuestions = [
    'How much did I spend on data this week?',
    `How much have I spent on ${stats.mostExpensiveNetwork} this month?`,
    'Which network do I spend the most money on?',
    'How can I reduce my monthly data expenses?',
    'Am I spending more on data than last month?',
    'Recommend a realistic monthly budget for me',
    'Which network accounts for the highest percentage?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await api.getAiInsights();
      setInsights(res.insights || []);
    } catch (err) {
      console.warn('Failed to load insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputPrompt).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatWithGemma(q, historyPayload);

      const aiReplyMsg: ChatMessage = {
        id: 'reply_' + Date.now(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReplyMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `⚠️ ${err?.message || 'Unable to connect to Gemma model. Please retry.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              DataWise Gemma AI Assistant
            </h2>
            <span className="rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
              Google Gemma
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized mobile data budgeting advisor grounded strictly in your verified Nigerian subscriptions
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-bold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Chat Advisor
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Savings Action Cards ({insights.length})
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="flex flex-col h-[640px] rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          {/* Chat Header info banner */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy Guaranteed:</strong> AI answers are strictly computed from your {subscriptions.length} recorded data transactions.
              </span>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome_reset',
                    role: 'assistant',
                    content: `Chat history reset. How can I assist you with your MTN, Glo, Airtel, or 9mobile data budget today?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              title="Reset conversation"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isAssistant
                        ? 'bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-xs'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    {isAssistant ? <Sparkles className="h-4 w-4 text-amber-300" /> : <UserIcon className="h-4 w-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-50 text-slate-800 dark:bg-slate-800/70 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800'
                        : 'bg-blue-600 text-white font-medium shadow-xs'
                    }`}
                  >
                    {/* Render basic markdown formatting safely */}
                    <div className="space-y-2 whitespace-pre-line">
                      {msg.content}
                    </div>
                    <span
                      className={`block text-[10px] mt-1.5 ${
                        isAssistant ? 'text-slate-600 dark:text-slate-300' : 'text-blue-100 text-right'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                  <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>Gemma AI is crunching your subscription transactions...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Prompt Chips */}
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
              Suggested questions:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-400 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Gemma about your Nigerian data spend, budgets, or savings..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-600 font-medium"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Recommendations Tab */
        <div className="space-y-4">
          <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Gemma Autonomous Cost-Saving Engine</h4>
              <p className="mt-1 leading-relaxed">
                The AI continuously evaluates your data purchase cadence and compares it against active Nigerian telecom tariffs (MTN, Glo, Airtel, 9mobile). Here are actionable moves to optimize your spend:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins) => (
              <div
                key={ins.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {ins.badge}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      Potential Save: {ins.savingsEst}
                    </span>
                  </div>

                  <h4 className="mt-3 font-bold text-slate-900 dark:text-white text-sm">
                    {ins.title}
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ins.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Impact: <strong className="text-slate-700 dark:text-slate-200">{ins.impact}</strong>
                  </span>
                  <button
                    onClick={() => {
                      if (ins.actionLabel.includes('Budget')) onNavigate('budgets');
                      else onNavigate('subscriptions');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <span>{ins.actionLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
