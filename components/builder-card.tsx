'use client';

import Link from 'next/link';
import { Avatar } from '@/components/avatar';
import { SocialLinks } from '@/components/social-links';
import { VerifiedBadge } from '@/components/verified-badge';
import { formatAddress } from '@/lib/user-utils';
import { getChainBadgeClass } from '@/lib/chain-stats';
import type { Profile } from '@/lib/supabase';

interface BuilderCardProps {
  builder: Profile & { 
    total_received?: number;
    base_total?: number;
    celo_total?: number;
  };
  showStats?: boolean;
}

export function BuilderCard({ builder, showStats = false }: BuilderCardProps) {
  const hasSocialLinks = builder.twitter_url || builder.github_url || builder.linkedin_url;
  
  return (
    <Link
      href={`/builder/${builder.wallet_address}`}
      className="group rounded-lg border border-zinc-200 p-4 transition-colors hover:border-[#FFBF00] hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 sm:p-6"
    >
      <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
        <Avatar
          src={builder.avatar_url}
          alt={builder.username || 'Avatar'}
          fallback={builder.username?.charAt(0).toUpperCase() || '?'}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-semibold text-foreground truncate">
              @{builder.username || 'Anonymous'}
            </h3>
            {builder.verified && <VerifiedBadge size="sm" />}
          </div>
          {!builder.username && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 truncate">
              {formatAddress(builder.wallet_address)}
            </p>
          )}
        </div>
      </div>
      {builder.bio && (
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
          {builder.bio}
        </p>
      )}
      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
        {showStats && (builder.base_total !== undefined || builder.celo_total !== undefined) ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Received</span>
            <div className="flex gap-2 flex-wrap">
              {builder.base_total && builder.base_total > 0 && (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getChainBadgeClass(8453)}`}>
                  {builder.base_total.toFixed(4)} ETH
                </span>
              )}
              {builder.celo_total && builder.celo_total > 0 && (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getChainBadgeClass(42220)}`}>
                  {builder.celo_total.toFixed(4)} CELO
                </span>
              )}
            </div>
          </div>
        ) : hasSocialLinks ? (
          <SocialLinks
            twitterUrl={builder.twitter_url}
            githubUrl={builder.github_url}
            linkedinUrl={builder.linkedin_url}
            size="sm"
            className="w-full justify-end"
          />
        ) : null}
      </div>
    </Link>
  );
}
