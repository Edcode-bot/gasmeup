'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabaseClient } from '@/lib/supabase-client';
import { Copy, Share2, ExternalLink, Users } from 'lucide-react';
import { CopyProfileUrl } from '@/components/copy-button';
import { ShareProfile } from '@/components/share-button';
import { useToastContext } from '@/components/toast-provider';
import { getExplorerUrl } from '@/lib/blockchain';
import Link from 'next/link';

export function QuickActions() {
  const { authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { success } = useToastContext();

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

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authenticated, user?.wallet?.address]);

  if (!authenticated || loading || !profile) {
    return null;
  }

  const profileUrl = `https://gasmeup-sable.vercel.app/builder/${user?.wallet?.address || ''}`;
  const explorerUrl = getExplorerUrl(8453, user?.wallet?.address || ''); // Base explorer

  const actions = [
    {
      icon: Copy,
      label: 'Copy Profile Link',
      description: 'Share your profile with others',
      component: (
        <CopyProfileUrl 
          address={user?.wallet?.address || ''}
          username={profile?.username || undefined}
          className="w-full justify-start"
        />
      )
    },
    {
      icon: Share2,
      label: 'Share on Social',
      description: 'Share on Farcaster and more',
      component: (
        <ShareProfile 
          username={profile.username}
          address={user?.wallet?.address || ''}
          className="w-full"
        />
      )
    },
    {
      icon: ExternalLink,
      label: 'View on Explorer',
      description: 'See your wallet on Base',
      component: (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 w-full justify-start"
        >
          <ExternalLink className="w-4 h-4" />
          Open Explorer
        </a>
      )
    },
    {
      icon: Users,
      label: 'Explore Builders',
      description: 'Discover other builders',
      component: (
        <Link href="/explore">
          <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 w-full justify-start">
            <Users className="w-4 h-4" />
            Explore
          </button>
        </Link>
      )
    }
  ];

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
      <div className="grid gap-2">
        {actions.map((action, index) => (
          <div key={index} className="group">
            <div className="flex items-center gap-3 mb-1">
              <action.icon className="w-4 h-4 text-zinc-400 group-hover:text-[#FFBF00] transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{action.description}</p>
              </div>
            </div>
            <div className="ml-7">
              {action.component}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function QuickActionsCompact() {
  const { authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<any>(null);
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

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authenticated, user?.wallet?.address]);

  if (!authenticated || loading || !profile) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <CopyProfileUrl 
        address={user?.wallet?.address || ''}
        username={profile?.username || undefined}
        className="text-sm"
      />
      <ShareProfile 
        username={profile?.username || undefined}
        address={user?.wallet?.address || ''}
        className="text-sm"
      />
      <Link href="/explore">
        <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Users className="w-4 h-4" />
          Explore
        </button>
      </Link>
    </div>
  );
}
