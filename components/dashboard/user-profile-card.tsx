'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Avatar } from '@/components/avatar';
import { supabaseClient } from '@/lib/supabase-client';
import { formatAddress } from '@/lib/user-utils';
import Link from 'next/link';
import type { Profile } from '@/lib/supabase';

export function UserProfileCard() {
  const { authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated || !user?.wallet?.address || !supabaseClient) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const client = supabaseClient;
      const walletAddr = user.wallet?.address;
      if (!client || !walletAddr) return;

      try {
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .eq('wallet_address', walletAddr.toLowerCase())
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authenticated, user?.wallet?.address]);

  if (!authenticated) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-2 text-xl font-semibold text-foreground">My Profile</h2>
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          Connect your wallet to create or update your profile.
        </p>
        <Link
          href="/dashboard/profile"
          className="inline-block rounded-full bg-[#FFBF00] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Create Profile
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-2 text-xl font-semibold text-foreground">My Profile</h2>
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">My Profile</h2>
      {profile ? (
        <>
          <div className="mb-4 flex items-center gap-4">
            <Avatar
              src={profile.avatar_url}
              alt={profile.username || 'Avatar'}
              fallback={profile.username?.charAt(0).toUpperCase() || '?'}
              size="md"
            />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Welcome @{profile.username || 'Anonymous'}!
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                {formatAddress(profile.wallet_address)}
              </p>
            </div>
          </div>
          {profile.bio && (
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
              {profile.bio}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/builder/${profile.wallet_address}`}
              className="min-h-[44px] flex-1 rounded-full border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              View Profile
            </Link>
            <Link
              href="/dashboard/profile"
              className="min-h-[44px] flex-1 rounded-full bg-[#FFBF00] px-4 py-2.5 text-center text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Edit Profile
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">
            Create your builder profile to start receiving support from the community.
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-block rounded-full bg-[#FFBF00] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Create Profile
          </Link>
        </>
      )}
    </div>
  );
}

