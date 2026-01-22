'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LandingNavbar } from '@/components/landing-navbar';
import { ConnectWallet } from '@/components/connect-wallet';
import { BuilderCard } from '@/components/builder-card';
import { supabaseClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/supabase';

interface BuilderWithTotal extends Profile {
  total_received: number;
}

export default function ExplorePage() {
  const { ready, authenticated } = usePrivy();
  const [builders, setBuilders] = useState<BuilderWithTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    const fetchBuilders = async () => {
      const client = supabaseClient;
      if (!client) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all profiles
        const { data: profiles, error: profilesError } = await client
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setLoading(false);
          return;
        }

        if (!profiles || profiles.length === 0) {
          setBuilders([]);
          setLoading(false);
          return;
        }

        // Fetch total received for each builder
        const buildersWithTotals = await Promise.all(
          profiles.map(async (profile) => {
            const { data: supports } = await client
              .from('supports')
              .select('amount')
              .eq('to_address', profile.wallet_address);

            const totalReceived =
              supports?.reduce((sum, support) => sum + Number(support.amount), 0) || 0;

            return {
              ...profile,
              total_received: totalReceived,
            };
          })
        );

        // Sort by total received (descending)
        buildersWithTotals.sort((a, b) => b.total_received - a.total_received);

        setBuilders(buildersWithTotals);
      } catch (err) {
        console.error('Failed to fetch builders:', err);
        setBuilders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilders();
  }, []);

  // Filter builders by search query and verification status
  const filteredBuilders = builders.filter((builder) => {
    // Verified filter
    if (verifiedOnly && !builder.verified) return false;
    
    // Search filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      builder.username?.toLowerCase().includes(query) ||
      builder.wallet_address.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Explore Builders</h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                  {ready && authenticated
                    ? 'Discover and support builders in the community'
                    : 'Connect your wallet to start supporting builders'}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 sm:mb-8 space-y-4">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-[#FFBF00] focus:ring-[#FFBF00] dark:border-zinc-700"
                />
                <span className="text-sm font-medium text-foreground flex items-center gap-1">
                  <span className="text-[#FFBF00]">✓</span> Verified Builders Only
                </span>
              </label>
            </div>
          </div>

          {/* Builders List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">Loading builders...</p>
            </div>
          ) : filteredBuilders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">
                {searchQuery ? 'No builders found matching your search.' : 'No builders yet.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBuilders.map((builder) => (
                <BuilderCard key={builder.id} builder={builder} showStats={true} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

