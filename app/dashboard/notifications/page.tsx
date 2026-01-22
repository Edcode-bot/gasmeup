'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { supabaseClient } from '@/lib/supabase-client';
import type { Notification } from '@/lib/supabase';
import { Bell, CheckCircle2, MessageSquare, Heart, DollarSign, Shield, Check } from 'lucide-react';
import Link from 'next/link';
// Simple time formatter
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

const notificationIcons = {
  contribution: DollarSign,
  comment: MessageSquare,
  like: Heart,
  follow: User,
  admin: Shield,
};

const notificationColors = {
  contribution: 'text-green-600 dark:text-green-400',
  comment: 'text-blue-600 dark:text-blue-400',
  like: 'text-red-600 dark:text-red-400',
  follow: 'text-purple-600 dark:text-purple-400',
  admin: 'text-[#FFBF00]',
};

function User({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

export default function NotificationsPage() {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const userAddress = user?.wallet?.address?.toLowerCase();

  useEffect(() => {
    if (!ready || !authenticated || !userAddress) {
      if (ready && !authenticated) {
        router.push('/');
      }
      return;
    }

    fetchNotifications();

    // Subscribe to real-time updates
    const client = supabaseClient;
    if (!client) return;

    const channel = client
      .channel(`notifications:${userAddress}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_address=eq.${userAddress}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [ready, authenticated, userAddress, router]);

  const fetchNotifications = async () => {
    const client = supabaseClient;
    if (!client || !userAddress) return;

    try {
      const { data, error } = await client
        .from('notifications')
        .select('*')
        .eq('user_address', userAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const client = supabaseClient;
    if (!client) return;

    try {
      await client
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const client = supabaseClient;
    if (!client || !userAddress) return;

    try {
      await client
        .from('notifications')
        .update({ read: true })
        .eq('user_address', userAddress)
        .eq('read', false);

      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Group notifications by time
  const groupedNotifications = {
    today: notifications.filter(
      (n) => new Date(n.created_at).toDateString() === new Date().toDateString()
    ),
    thisWeek: notifications.filter((n) => {
      const date = new Date(n.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo && date.toDateString() !== new Date().toDateString();
    }),
    earlier: notifications.filter((n) => {
      const date = new Date(n.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date < weekAgo;
    }),
  };

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between sm:mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Notifications</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <Bell className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">No notifications yet</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                You'll see notifications here when you receive contributions, comments, or likes.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Today */}
              {groupedNotifications.today.length > 0 && (
                <div>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Today
                  </h2>
                  <div className="space-y-3">
                    {groupedNotifications.today.map((notification) => {
                      const Icon = notificationIcons[notification.type] || Bell;
                      const colorClass = notificationColors[notification.type] || 'text-zinc-600 dark:text-zinc-400';
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors ${
                            notification.read
                              ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                              : 'border-[#FFBF00] bg-[#FFBF00]/5 dark:border-[#FFBF00] dark:bg-[#FFBF00]/10'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${notification.read ? 'text-foreground' : 'text-foreground'}`}>
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{notification.message}</p>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                              {formatTimeAgo(new Date(notification.created_at))}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-[#FFBF00]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* This Week */}
              {groupedNotifications.thisWeek.length > 0 && (
                <div>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    This Week
                  </h2>
                  <div className="space-y-3">
                    {groupedNotifications.thisWeek.map((notification) => {
                      const Icon = notificationIcons[notification.type] || Bell;
                      const colorClass = notificationColors[notification.type] || 'text-zinc-600 dark:text-zinc-400';
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors ${
                            notification.read
                              ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                              : 'border-[#FFBF00] bg-[#FFBF00]/5 dark:border-[#FFBF00] dark:bg-[#FFBF00]/10'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${notification.read ? 'text-foreground' : 'text-foreground'}`}>
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{notification.message}</p>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                              {formatTimeAgo(new Date(notification.created_at))}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-[#FFBF00]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Earlier */}
              {groupedNotifications.earlier.length > 0 && (
                <div>
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Earlier
                  </h2>
                  <div className="space-y-3">
                    {groupedNotifications.earlier.map((notification) => {
                      const Icon = notificationIcons[notification.type] || Bell;
                      const colorClass = notificationColors[notification.type] || 'text-zinc-600 dark:text-zinc-400';
                      return (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition-colors ${
                            notification.read
                              ? 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                              : 'border-[#FFBF00] bg-[#FFBF00]/5 dark:border-[#FFBF00] dark:bg-[#FFBF00]/10'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${notification.read ? 'text-foreground' : 'text-foreground'}`}>
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{notification.message}</p>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                              {formatTimeAgo(new Date(notification.created_at))}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-[#FFBF00]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
