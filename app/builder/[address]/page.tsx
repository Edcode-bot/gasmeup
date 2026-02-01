import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { formatAmountWithToken } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Profile, Support } from '@/lib/supabase';
import { getTokenSymbol, type SupportedChainId } from '@/lib/blockchain';
import { SocialLinks } from '@/components/social-links';
import { CopyLinkButton } from '@/components/copy-link-button';
import { VerifiedBadge } from '@/components/verified-badge';
import { UserDisplay } from '@/components/user-display';
import { formatAddress } from '@/lib/user-utils';
import { NoSupportersEmpty } from '@/components/empty-state';
import { TokenAmountWithChain } from '@/components/chain-icon';
import { formatRelativeTime } from '@/lib/time-utils';
import { getBuilderChainStats, getChainName } from '@/lib/chain-stats';

interface BuilderPageProps {
  params: Promise<{ address: string }>;
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const { address } = await params;
  const formattedAddress = formatAddress(address);

  // Fetch builder profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', address.toLowerCase())
    .single();

  // Fetch all supports for this builder (for accurate stats)
  const { data: allSupports } = await supabase
    .from('supports')
    .select('*')
    .eq('to_address', address.toLowerCase())
    .order('created_at', { ascending: false });

  // Fetch posts count for updates tab badge
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('builder_address', address.toLowerCase());

  // Fetch projects count for projects tab badge
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('builder_address', address.toLowerCase());

  // Fetch recent supports for display (last 10)
  const supports = allSupports?.slice(0, 10) || [];

  // Get chain-specific stats
  const chainStats = await getBuilderChainStats(address);
  
  // Calculate legacy stats for compatibility
  const totalRaised = chainStats.base.total + chainStats.celo.total;
  const uniqueSupporters = new Set([...chainStats.base.supporters, ...chainStats.celo.supporters]).size;
  const totalContributions = chainStats.base.count + chainStats.celo.count;
  const averageContribution = totalContributions > 0 ? totalRaised / totalContributions : 0;
  
  // Calculate contributions this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthContributions = allSupports?.filter(
    (s) => new Date(s.created_at) >= startOfMonth
  ).length || 0;
  
  // Use clean username URL if available, otherwise fallback to address
  const profileUrl = profile?.username 
    ? `https://gasmeup-sable.vercel.app/${profile.username}`
    : `https://gasmeup-sable.vercel.app/builder/${address}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                    @{profile?.username || 'Anonymous'}
                  </h1>
                  {profile?.verified && <VerifiedBadge size="lg" />}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formattedAddress}
                </p>
              </div>
              <CopyLinkButton url={profileUrl} />
            </div>
          </div>
          
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">About</h2>
              {profile?.bio ? (
                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap mb-4">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-500 italic mb-4">
                  No bio available yet.
                </p>
              )}
              <SocialLinks
                twitterUrl={profile?.twitter_url}
                githubUrl={profile?.github_url}
                linkedinUrl={profile?.linkedin_url}
                size="lg"
              />
            </div>
            
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">Funding Stats</h2>
              <div className="space-y-3">
                {/* Chain-specific totals */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-600 text-xs font-medium dark:text-blue-400">Base</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {chainStats.base.total.toFixed(4)} ETH
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {chainStats.base.count} supporters
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-600 text-xs font-medium dark:text-yellow-400">Celo</span>
                    </div>
                    <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                      {chainStats.celo.total.toFixed(4)} CELO
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      {chainStats.celo.count} supporters
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Total Supporters</span>
                  <span className="font-semibold text-foreground">{uniqueSupporters}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Average Contribution</span>
                  <span className="font-semibold text-foreground">
                    {averageContribution.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400">Contributions This Month</span>
                  <span className="font-semibold text-foreground">{thisMonthContributions}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-zinc-400">Total Contributions</span>
                  <span className="font-semibold text-foreground">{totalContributions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-zinc-200 dark:border-zinc-800 sm:mt-8">
            <div className="flex gap-4">
              <Link
                href={`/builder/${address}`}
                className="border-b-2 border-[#FFBF00] px-1 pb-3 text-sm font-medium text-foreground"
              >
                Contributions
              </Link>
              <Link
                href={`/builder/${address}/updates`}
                className="flex items-center gap-2 border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-foreground dark:text-zinc-400 dark:hover:border-zinc-700"
              >
                Updates
                {postsCount && postsCount > 0 && (
                  <span className="rounded-full bg-[#FFBF00] px-2 py-0.5 text-xs font-medium text-black">
                    {postsCount}
                  </span>
                )}
              </Link>
              <Link
                href={`/builder/${address}/projects`}
                className="flex items-center gap-2 border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-foreground dark:text-zinc-400 dark:hover:border-zinc-700"
              >
                Projects
                {projectsCount && projectsCount > 0 && (
                  <span className="rounded-full bg-[#FFBF00] px-2 py-0.5 text-xs font-medium text-black">
                    {projectsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {supports && supports.length > 0 && (
            <div className="mt-4 overflow-x-auto sm:mt-6">
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
                <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">Recent Contributions</h2>
                {supports.length > 0 ? (
                <div className="space-y-4">
                  {supports.map((support) => (
                    <div
                      key={support.id}
                      className="flex flex-col gap-2 border-b border-zinc-100 pb-3 last:border-0 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <UserDisplay 
                          address={support.from_address}
                          showAvatar={true}
                          size="md"
                          className="mb-1"
                        />
                        {support.message && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 break-words">
                            {support.message}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                          {formatRelativeTime(support.created_at)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <TokenAmountWithChain 
                          amount={Number(support.amount)}
                          chainId={support.chain_id}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <NoSupportersEmpty 
                  address={address} 
                  username={profile?.username}
                />
              )}
              </div>
            </div>
          )}
          
          <div className="mt-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:mt-6 sm:p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground sm:text-2xl">Fund This Builder</h2>
            <Link
              href={`/builder/${address}/support`}
              className="inline-block min-h-[44px] rounded-full bg-[#FFBF00] px-8 py-3 text-base font-medium text-black transition-opacity hover:opacity-90"
            >
              Contribute
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

