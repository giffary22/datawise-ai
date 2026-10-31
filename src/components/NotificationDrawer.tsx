import React from 'react';
import { Notification } from '../types';
import { X, CheckCheck, Trash2, Bell, AlertTriangle, Clock, Sparkles, TrendingUp, Info } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: Notification['notification_type']) => {
    switch (type) {
      case 'budget_alert':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'expiry_reminder':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'ai_tip':
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case 'spending_spike':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'weekly_summary':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  title="Mark all as read"
                  className="rounded-lg p-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60 transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark all</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Bell className="h-7 w-7" />
                </div>
                <h4 className="mt-4 font-bold text-slate-800 dark:text-slate-200 text-sm">No notifications</h4>
                <p className="mt-1 text-xs text-slate-500 max-w-xs">
                  We will alert you when you approach your budget limits or when data bundles are close to expiring.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`relative rounded-2xl p-4 border transition-all ${
                    notif.is_read
                      ? 'border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                      : 'border-blue-200 bg-blue-50/40 dark:border-blue-900/60 dark:bg-blue-950/20 text-slate-900 dark:text-slate-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-slate-800">
                      {getIcon(notif.notification_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 shrink-0">
                          {new Date(notif.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        {/* Quick action button depending on type */}
                        <div>
                          {notif.notification_type === 'budget_alert' && (
                            <button
                              onClick={() => {
                                onNavigate('budgets');
                                onClose();
                              }}
                              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Check Budget &rarr;
                            </button>
                          )}
                          {notif.notification_type === 'expiry_reminder' && (
                            <button
                              onClick={() => {
                                onNavigate('subscriptions');
                                onClose();
                              }}
                              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                            >
                              View Bundles &rarr;
                            </button>
                          )}
                          {notif.notification_type === 'ai_tip' && (
                            <button
                              onClick={() => {
                                onNavigate('ai');
                                onClose();
                              }}
                              className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              Ask Gemma AI &rarr;
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!notif.is_read && (
                            <button
                              onClick={() => onMarkRead(notif.id)}
                              className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(notif.id)}
                            title="Delete alert"
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
