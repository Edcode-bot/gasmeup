'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { LandingNavbar } from '@/components/landing-navbar';
import { ConnectWallet } from '@/components/connect-wallet';
import { BuilderCard } from '@/components/builder-card';
import { PageShell } from '@/components/layout/page-shell';
import { SectionCard } from '@/components/layout/section-card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { UI_TOKENS } from '@/lib/ui/tokens';
import { supabaseClient } from '@/lib/supabase-client';
import { getBuilderChainStats } from '@/lib/chain-stats';
import type { Profile } from '@/lib/supabase';
import { Search, Users, Shield } from 'lucide-react';

interface BuilderWithTotals extends Profile {
  base_total?: number;
  celo_total?: number;
}

export default function ExplorePage() {
  const { ready, authenticated } = usePrivy();
  const [builders, setBuilders] = useState<BuilderWithTotals[]>([]);
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

        // Fetch chain totals for each builder
        const buildersWithTotals = await Promise.all(
          profiles.map(async (profile) => {
            const chainStats = await getBuilderChainStats(profile.wallet_address);

            return {
              ...profile,
              base_total: chainStats.base.total,
              celo_total: chainStats.celo.total,
            };
          })
        );

        // Sort by total received (descending)
        buildersWithTotals.sort((a, b) => {
          const totalA = (a.base_total || 0) + (a.celo_total || 0);
          const totalB = (b.base_total || 0) + (b.celo_total || 0);
          return totalB - totalA;
        });

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
      builder.bio?.toLowerCase().includes(query) ||
      builder.wallet_address.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1">
        <PageShell 
          title="Explore Builders"
          subtitle={ready && authenticated
            ? 'Discover and support builders in the community'
            : 'Connect your wallet to start supporting builders'
          }
          actions={
            authenticated && (
              <ConnectWallet />
            )
          }
        >
          <div className={UI_TOKENS.section.spacing}>
            {/* Filters Section */}
            <SectionCard title="Filters">
              <div className={UI_TOKENS.form.group}>
                <div>
                  <label className={UI_TOKENS.form.label}>
                    <Search className="inline h-4 w-4 mr-2" />
                    Search builders
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username, bio, or address..."
                    className={UI_TOKENS.form.input}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verified-only"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded border-zinc-300 text-[#FFBF00] focus:ring-[#FFBF00] dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <label htmlFor="verified-only" className="text-sm font-medium text-foreground">
                    <Shield className="inline h-4 w-4 mr-1" />
                    Verified builders only
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* Results Section */}
            <SectionCard 
              title={`Results (${filteredBuilders.length})`}
              description={loading ? "Loading builders..." : undefined}
            >
              {loading ? (
                <LoadingSkeleton type="card" count={6} />
              ) : filteredBuilders.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No builders found</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                    {searchQuery || verifiedOnly 
                      ? "Try adjusting your search or filters"
                      : "No builders available at the moment"
                    }
                  </p>
                  {searchQuery || verifiedOnly ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setVerifiedOnly(false);
                      }}
                      className="rounded-lg bg-[#FFBF00] px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition-opacity"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className={UI_TOKENS.grid.threeColumn}>
                  {filteredBuilders.map((builder) => (
                    <BuilderCard
                      key={builder.id}
                      builder={builder}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </PageShell>
      </main>
    </div>
  );
}
