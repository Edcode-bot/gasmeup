'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/supabase';
import { formatAddress } from '@/lib/utils';
import { Avatar } from '@/components/avatar';
import { Search, CheckCircle2, XCircle, Ban, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<(Profile & { total_raised?: number })[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<(Profile & { total_raised?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.username?.toLowerCase().includes(query) ||
          user.wallet_address.toLowerCase().includes(query)
      )
    );
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    const client = supabaseClient;
    if (!client) return;

    try {
      const { data: profiles, error } = await client
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate total raised for each user
      const usersWithTotals = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: supports } = await client
            .from('supports')
            .select('amount')
            .eq('to_address', profile.wallet_address);

          const totalRaised =
            supports?.reduce((sum, support) => sum + Number(support.amount || 0), 0) || 0;

          return {
            ...profile,
            total_raised: totalRaised,
          };
        })
      );

      setUsers(usersWithTotals);
      setFilteredUsers(usersWithTotals);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerified = async (walletAddress: string, currentVerified: boolean) => {
    const client = supabaseClient;
    if (!client) return;

    try {
      const newVerified = !currentVerified;
      const updateData: { verified: boolean; verified_at?: string | null } = {
        verified: newVerified,
      };

      if (newVerified) {
        updateData.verified_at = new Date().toISOString();
      } else {
        updateData.verified_at = null;
      }

      await client.from('profiles').update(updateData).eq('wallet_address', walletAddress);

      // Create verification notification if verifying
      if (newVerified) {
        const { notifyVerification } = await import('@/lib/notifications');
        await notifyVerification(walletAddress);
      }

      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle verified:', error);
    }
  };

  const handleAdminDelete = async (walletAddress: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    const client = supabaseClient;
    if (!client) return;
    
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      console.log('🗑️ Admin deleting user:', normalizedAddress);
      
      // Delete in order of dependencies to avoid foreign key constraints
      const deletionResults = await Promise.allSettled([
        // Delete post likes first
        client.from('post_likes').delete().eq('user_address', normalizedAddress),
        
        // Delete post comments
        client.from('post_comments').delete().eq('user_address', normalizedAddress),
        
        // Delete notifications for this user
        client.from('notifications').delete().eq('user_address', normalizedAddress),
        
        // Delete supports where user is either sender or receiver
        client.from('supports').delete().or(`from_address.eq.${normalizedAddress},to_address.eq.${normalizedAddress}`),
        
        // Delete posts
        client.from('posts').delete().eq('builder_address', normalizedAddress),
        
        // Delete projects
        client.from('projects').delete().eq('builder_address', normalizedAddress),
        
        // Delete profile
        client.from('profiles').delete().eq('wallet_address', normalizedAddress)
      ]);
      
      // Check if any deletions failed
      const failedDeletions = deletionResults.filter(result => result.status === 'rejected');
      if (failedDeletions.length > 0) {
        console.error('Some deletions failed:', failedDeletions);
        throw new Error('Some data could not be deleted. Please try again.');
      }
      
      console.log('✅ Admin user deletion completed successfully');
      alert('User deleted successfully');
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('❌ Admin delete failed:', error);
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-zinc-600 dark:text-zinc-400">Loading users...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">User Management</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Manage users, verify builders, and moderate accounts
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by username or wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pl-10 text-foreground placeholder-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Wallet</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Total Raised</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Verified</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar_url}
                          alt={user.username || 'User'}
                          fallback={user.username?.charAt(0).toUpperCase() || '?'}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-foreground">
                            {user.username || 'Unnamed User'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                        {formatAddress(user.wallet_address)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-foreground">
                        ${(user.total_raised || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {user.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleVerified(user.wallet_address, user.verified)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            user.verified
                              ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                          }`}
                        >
                          {user.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <Link
                          href={`/builder/${user.wallet_address}`}
                          className="rounded-lg bg-[#FFBF00] px-3 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleAdminDelete(user.wallet_address)}
                          className="rounded-lg bg-red-100 text-red-700 px-3 py-1.5 text-xs font-medium hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
