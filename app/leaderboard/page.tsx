import { LandingNavbar } from '@/components/landing-navbar';
import { VerifiedBadge } from '@/components/verified-badge';
import { Avatar } from '@/components/avatar';
import { getTopBuilders, getTopSupporters, getTopProjects, getSupporterBadge } from '@/lib/leaderboard';
import { formatAddress } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default async function LeaderboardPage() {
  const [topBuilders, topSupporters, topProjects] = await Promise.all([
    getTopBuilders(50),
    getTopSupporters(50),
    getTopProjects(50),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Leaderboard</h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Top builders, supporters, and projects on GasMeUp
            </p>
          </div>

          {/* Top Builders */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Top Builders</h2>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Builder</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Total Raised</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Supporters</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {topBuilders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-400">
                        No builders yet
                      </td>
                    </tr>
                  ) : (
                    topBuilders.map((builder) => (
                      <tr key={builder.wallet_address} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {builder.rank === 1 && <span className="text-2xl">🥇</span>}
                            {builder.rank === 2 && <span className="text-2xl">🥈</span>}
                            {builder.rank === 3 && <span className="text-2xl">🥉</span>}
                            {builder.rank > 3 && (
                              <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                                #{builder.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={builder.avatar_url}
                              alt={builder.username || 'Builder'}
                              fallback={builder.username?.charAt(0).toUpperCase() || '?'}
                              size="sm"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-foreground">
                                  {builder.username || formatAddress(builder.wallet_address)}
                                </span>
                                {builder.verified && <VerifiedBadge size="sm" />}
                              </div>
                              {builder.username && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                                  {formatAddress(builder.wallet_address)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-semibold text-foreground">
                            ${builder.total_raised.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-zinc-600 dark:text-zinc-400">{builder.supporter_count}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            href={`/builder/${builder.wallet_address}`}
                            className="text-sm text-[#FFBF00] hover:underline"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top Supporters */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Top Supporters</h2>
            <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Supporter</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Total Given</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Builders Supported</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Contributions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {topSupporters.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-zinc-600 dark:text-zinc-400">
                        No supporters yet
                      </td>
                    </tr>
                  ) : (
                    topSupporters.map((supporter) => {
                      const badge = getSupporterBadge(supporter.total_given);
                      return (
                        <tr key={supporter.wallet_address} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {supporter.rank === 1 && <span className="text-2xl">🥇</span>}
                              {supporter.rank === 2 && <span className="text-2xl">🥈</span>}
                              {supporter.rank === 3 && <span className="text-2xl">🥉</span>}
                              {supporter.rank > 3 && (
                                <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                                  #{supporter.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {badge.tier !== 'none' && (
                                <span className="text-xl" title={badge.name}>
                                  {badge.emoji}
                                </span>
                              )}
                              <span className="font-medium text-foreground">
                                {supporter.username || formatAddress(supporter.wallet_address)}
                              </span>
                            </div>
                            {supporter.username && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                                {formatAddress(supporter.wallet_address)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold text-foreground">
                              ${supporter.total_given.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {supporter.builders_supported}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {supporter.contributions_count}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top Projects */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Top Projects</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topProjects.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-600 dark:text-zinc-400">
                  No projects yet
                </div>
              ) : (
                topProjects.map((project) => {
                  const progressPercent = project.goal_amount
                    ? Math.min(100, (project.raised_amount / project.goal_amount) * 100)
                    : 0;
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
                    >
                      <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Image
                          src={project.image_url}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full bg-[#FFBF00]/20 px-2 py-1 text-xs font-semibold text-[#FFBF00]">
                          #{project.rank}
                        </span>
                        {project.rank <= 3 && (
                          <span className="text-2xl">
                            {project.rank === 1 && '🥇'}
                            {project.rank === 2 && '🥈'}
                            {project.rank === 3 && '🥉'}
                          </span>
                        )}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-500">
                        by {project.builder_username || formatAddress(project.builder_address)}
                      </p>
                      <div className="mb-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-full bg-[#FFBF00] transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          ${project.raised_amount.toFixed(2)}
                        </span>
                        {project.goal_amount && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-500">
                            of ${project.goal_amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
