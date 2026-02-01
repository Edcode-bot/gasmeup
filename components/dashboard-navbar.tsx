'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { formatAddress } from '@/lib/utils';
import { Avatar } from '@/components/avatar';
import { supabaseClient } from '@/lib/supabase-client';
import { Bell, Home, Users, DollarSign, FileText, Settings, Menu, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/projects', label: 'Projects', icon: FileText },
  { href: '/dashboard/posts', label: 'Posts', icon: FileText },
  { href: '/dashboard/buttons', label: 'Share', icon: Settings },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
];

const moreItems = [
  { href: '/explore', label: 'Explore Builders', icon: Users },
  { href: '/projects', label: 'All Projects', icon: DollarSign },
  { href: '/leaderboard', label: 'Leaderboard', icon: Users },
];

  const isActive = (href: string) => pathname === href;

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 backdrop-blur-sm dark:bg-zinc-900/80">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#FFBF00]">GasMeUp</span>
          </Link>

          {/* Desktop Navigation - Tabs */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {/* Main Tabs */}
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-700">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    isActive(item.href)
                      ? 'text-[#FFBF00] border-[#FFBF00]'
                      : 'border-transparent text-zinc-600 hover:text-foreground dark:text-zinc-400'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFBF00] text-xs font-semibold text-black">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* More Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2"
              >
                More
                <Menu className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <Card className="absolute right-0 top-full mt-2 w-48 z-20">
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        {moreItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive(item.href)
                                ? 'bg-[#FFBF00]/10 text-[#FFBF00]'
                                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            {unreadCount > 0 && (
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFBF00] text-xs font-semibold text-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </Button>
              </Link>
            )}

            {/* User Avatar */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-full bg-[#FFBF00] flex items-center justify-center text-xs font-semibold text-black">
                  {user?.wallet?.address ? formatAddress(user.wallet.address).slice(0, 2).toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline text-sm text-zinc-700 dark:text-zinc-300">
                  {formatAddress(user?.wallet?.address || '')}
                </span>
              </Button>
              
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <Card className="absolute right-0 top-full mt-2 w-48 z-20">
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          <Settings className="h-4 w-4" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 w-full text-left"
                        >
                          Logout
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 lg:hidden">
            <div className="px-4 py-4">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-[#FFBF00]/10 text-[#FFBF00]'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFBF00] text-xs font-semibold text-black">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                {moreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-[#FFBF00]/10 text-[#FFBF00]'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Settings className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 w-full text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
