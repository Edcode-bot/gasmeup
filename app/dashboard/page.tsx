import { DashboardNavbar } from '@/components/dashboard-navbar';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BuilderCard } from '@/components/builder-card';
import { UserContributions } from '@/components/dashboard/user-contributions';
import { UserProfileCard } from '@/components/dashboard/user-profile-card';
import { ProfileCompletionIndicator } from '@/components/profile-completion-indicator';
import { QuickActions } from '@/components/quick-actions';
import { getGlobalChainStats } from '@/lib/chain-stats';

export default async function Dashboard() {
  // Fetch active builders (profiles with at least one support)
  const { data: activeBuilders } = await supabase
    .from('profiles')
    .select('*, supports!inner(count)')
    .order('created_at', { ascending: false })
    .limit(6);

  // Get unique builder addresses from supports to find active builders
  const { data: builderAddresses } = await supabase
    .from('supports')
    .select('to_address')
    .order('created_at', { ascending: false });

  const uniqueBuilderAddresses = [
    ...new Set(builderAddresses?.map((s) => s.to_address) || []),
  ].slice(0, 6);

  const { data: builders } = await supabase
    .from('profiles')
    .select('*')
    .in('wallet_address', uniqueBuilderAddresses)
    .limit(6);

  // Get total contributions count
  const { count: totalContributions } = await supabase
    .from('supports')
    .select('*', { count: 'exact', head: true });

  // Get total builders count
  const { count: totalBuilders } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get global chain statistics
  const chainStats = await getGlobalChainStats();

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Dashboard</h1>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                href="/dashboard/projects/new"
                className="min-h-[44px] rounded-full bg-[#FFBF00] px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                + New Project
              </Link>
              <Link
                href="/dashboard/posts/new"
                className="min-h-[44px] rounded-full bg-[#FFBF00] px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                + New Post
              </Link>
              <Link
                href="/dashboard/projects"
                className="min-h-[44px] rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                My Projects
              </Link>
              <Link
                href="/dashboard/posts"
                className="min-h-[44px] rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                My Posts
              </Link>
              <Link
                href="/dashboard/buttons"
                className="min-h-[44px] rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Share & Buttons
              </Link>
            </div>
          </div>
          
          {/* Welcome Banner for New Users */}
          <div className="mb-6 rounded-lg border border-[#FFBF00]/20 bg-[#FFBF00]/5 p-4 dark:border-[#FFBF00]/30 dark:bg-[#FFBF00]/10">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-foreground">Welcome to GasMeUp!</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  You can explore projects and support builders right away. Profile details can be added later when you're ready to receive funding.
                </p>
              </div>
              <Link
                href="/projects"
                className="min-h-[36px] rounded-full bg-[#FFBF00] px-4 py-1.5 text-xs font-medium text-black transition-opacity hover:opacity-90"
              >
                Explore Projects
              </Link>
            </div>
          </div>
          
          <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <UserProfileCard />
              <ProfileCompletionIndicator />
              <UserContributions />
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <QuickActions />
              
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-foreground mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    href="/dashboard/projects/new"
                    className="block rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    + New Project
                  </Link>
                  <Link
                    href="/dashboard/posts/new"
                    className="block rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    + New Post
                  </Link>
                  <Link
                    href="/explore"
                    className="block rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Explore Builders
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
              <h2 className="mb-2 text-lg font-semibold text-foreground sm:text-xl">Total Builders</h2>
              <p className="text-2xl font-bold text-[#FFBF00] sm:text-3xl">{totalBuilders || 0}</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 text-sm font-medium dark:text-blue-400">Base Network</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 sm:text-3xl">{chainStats.base.total.toFixed(2)} ETH</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">{chainStats.base.count} contributions</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 dark:bg-yellow-900/20 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600 text-sm font-medium dark:text-yellow-400">Celo Network</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 sm:text-3xl">{chainStats.celo.total.toFixed(2)} CELO</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{chainStats.celo.count} contributions</p>
            </div>
            
            <div className="rounded-lg border border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
              <h2 className="mb-2 text-lg font-semibold text-foreground sm:text-xl">Active Builders</h2>
              <p className="text-2xl font-bold text-[#FFBF00] sm:text-3xl">{uniqueBuilderAddresses.length}</p>
            </div>
          </div>

          {builders && builders.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">Active Builders</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {builders.map((builder) => (
                  <BuilderCard key={builder.id} builder={builder} showStats={false} />
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            <UserContributions />
            <UserProfileCard />
          </div>
        </div>
      </main>
    </div>
  );
}

