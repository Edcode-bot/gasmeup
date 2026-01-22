'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { formatAddress } from '@/lib/utils';
import { Avatar } from '@/components/avatar';
import { supabaseClient } from '@/lib/supabase-client';
import { Bell } from 'lucide-react';

export function DashboardNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { ready, authenticated, logout, user } = usePrivy();
  const userAddress = user?.wallet?.address?.toLowerCase();

  useEffect(() => {
    if (!ready || !authenticated || !userAddress) return;

    const fetchUnreadCount = async () => {
      const client = supabaseClient;
      if (!client) return;

      try {
        const { count } = await client
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_address', userAddress)
          .eq('read', false);

        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time updates
    const client = supabaseClient;
    if (!client) return;

    const channel = client
      .channel(`notifications_count:${userAddress}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_address=eq.${userAddress}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [ready, authenticated, userAddress]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setUserMenuOpen(false);
    setIsOpen(false);
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/explore', label: 'Explore Builders' },
    { href: '/projects', label: 'Projects' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/dashboard/projects', label: 'My Projects' },
    { href: '/dashboard/posts', label: 'My Posts' },
    { href: '/dashboard/buttons', label: 'Share & Buttons' },
    { href: '/dashboard/notifications', label: 'Notifications', badge: unreadCount },
  ];

  const isActive = (href: string) => pathname === href;

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#FFBF00]">GasMeUp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-[#FFBF00]'
                    : 'text-zinc-600 hover:text-foreground dark:text-zinc-400'
                }`}
              >
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFBF00] text-xs font-semibold text-black">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* User Menu */}
            <div className="relative ml-4">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <div className="h-8 w-8 rounded-full bg-[#FFBF00] flex items-center justify-center text-xs font-semibold text-black">
                  {user?.wallet?.address ? formatAddress(user.wallet.address).slice(0, 2).toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline">{formatAddress(user?.wallet?.address || '')}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-zinc-200 bg-white py-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#FFBF00]/10 text-[#FFBF00]'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFBF00] text-xs font-semibold text-black">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <Link
                href="/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
