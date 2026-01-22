'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { Users, Package, DollarSign, TrendingUp, FileText, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuilders: 0,
    totalSupporters: 0,
    totalContributions: 0,
    totalVolume: 0,
    activeProjects: 0,
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const client = supabaseClient;
    if (!client) return;

    try {
      // Total users (profiles)
      const { count: totalUsers } = await client
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total builders (profiles with at least one support received)
      const { data: allSupports } = await client.from('supports').select('to_address, from_address');
      const uniqueBuilders = new Set(allSupports?.map((s) => s.to_address) || []);
      const totalBuilders = uniqueBuilders.size;

      // Total supporters (unique from_address)
      const uniqueSupporters = new Set(allSupports?.map((s) => s.from_address) || []);
      const totalSupporters = uniqueSupporters.size;

      // Total contributions
      const { count: totalContributions } = await client
        .from('supports')
        .select('*', { count: 'exact', head: true });

      // Total volume
      const { data: allSupportsData } = await client.from('supports').select('amount');
      const totalVolume =
        allSupportsData?.reduce((sum, s) => sum + Number(s.amount || 0), 0) || 0;

      // Active projects
      const { count: activeProjects } = await client
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Total posts
      const { count: totalPosts } = await client
        .from('posts')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        totalBuilders,
        totalSupporters,
        totalContributions: totalContributions || 0,
        totalVolume,
        activeProjects: activeProjects || 0,
        totalPosts: totalPosts || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Platform overview and statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Builders</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalBuilders}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Supporters</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalSupporters}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#FFBF00]/10 p-3">
                <DollarSign className="h-6 w-6 text-[#FFBF00]" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Volume</p>
                <p className="text-2xl font-bold text-foreground">${stats.totalVolume.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Contributions</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalContributions}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900">
                <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Projects</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeProjects}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-pink-100 p-3 dark:bg-pink-900">
                <FileText className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Posts</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <a
            href="/admin/users"
            className="rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-[#FFBF00] dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="mb-2 text-lg font-semibold text-foreground">User Management</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Manage users, verify builders, and moderate accounts
            </p>
          </a>
          <a
            href="/admin/content"
            className="rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-[#FFBF00] dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="mb-2 text-lg font-semibold text-foreground">Content Moderation</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Review and moderate posts, projects, and comments
            </p>
          </a>
          <a
            href="/admin/settings"
            className="rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-[#FFBF00] dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="mb-2 text-lg font-semibold text-foreground">Platform Settings</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Configure platform fees, features, and maintenance mode
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}
