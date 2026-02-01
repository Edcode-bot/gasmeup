'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Avatar } from '@/components/avatar';
import { supabaseClient } from '@/lib/supabase-client';
import { formatAddress } from '@/lib/user-utils';
import Link from 'next/link';
import type { Profile } from '@/lib/supabase';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <Card>
        <CardHeader 
          title="My Profile"
          subtitle="Connect your wallet to create or update your profile."
          action={
            <Link href="/dashboard/profile">
              <Button size="sm">Create Profile</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader title="My Profile">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="My Profile"
        action={
          profile && (
            <Link href={`/builder/${profile.wallet_address}`}>
              <Button variant="secondary" size="sm">View Profile</Button>
            </Link>
          )
        }
      />
      <CardContent>
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
              <Link href={`/builder/${profile.wallet_address}`}>
                <Button variant="secondary" className="flex-1">View Profile</Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button className="flex-1">Edit Profile</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              You can explore projects and support builders right away. Create your profile later to receive funding.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/projects">
                <Button variant="secondary" className="flex-1">Explore Projects</Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button className="flex-1">Create Profile</Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

