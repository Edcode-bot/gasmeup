'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabaseClient } from '@/lib/supabase-client';
import { Check, X, Plus, Link2, User, FileText } from 'lucide-react';
import Link from 'next/link';
import type { Profile } from '@/lib/supabase';

interface CompletionItem {
  key: keyof Profile | 'social_links';
  label: string;
  description: string;
  points: number;
  completed: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export function ProfileCompletionIndicator() {
  const { authenticated, user } = usePrivy();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(0);

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
        
        // Calculate completion percentage
        const items = getCompletionItems(data);
        const completedPoints = items.filter(item => item.completed).reduce((sum, item) => sum + item.points, 0);
        const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
        setCompletion(Math.round((completedPoints / totalPoints) * 100));
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authenticated, user?.wallet?.address]);

  function getCompletionItems(profile: Profile | null): CompletionItem[] {
    const items: CompletionItem[] = [
      {
        key: 'username',
        label: 'Username',
        description: 'Set a unique username',
        points: 25,
        completed: !!profile?.username
      },
      {
        key: 'bio',
        label: 'Bio',
        description: 'Tell people about yourself',
        points: 25,
        completed: !!profile?.bio && profile.bio.length > 10
      },
      {
        key: 'avatar_url',
        label: 'Profile Picture',
        description: 'Add a profile picture',
        points: 20,
        completed: !!profile?.avatar_url
      },
      {
        key: 'social_links',
        label: 'Social Links',
        description: 'Connect your social profiles',
        points: 30,
        completed: !!(profile?.twitter_url || profile?.github_url || profile?.linkedin_url)
      }
    ];

    return items;
  }

  if (!authenticated || loading) {
    return null;
  }

  const items = getCompletionItems(profile);
  const completedItems = items.filter(item => item.completed);
  const incompleteItems = items.filter(item => !item.completed);

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-foreground">Profile Completion</h3>
          <span className="text-sm font-semibold text-[#FFBF00]">{completion}%</span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-700">
          <div 
            className="bg-[#FFBF00] h-2 rounded-full transition-all duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {incompleteItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
            Complete your profile when you're ready - it's optional for exploring:
          </p>
          {incompleteItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex items-center justify-center">
                  <X className="w-3 h-3 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.description}</p>
                </div>
              </div>
              <Link href="/dashboard">
                <button className="text-xs text-[#FFBF00] hover:opacity-80 flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}

      {completedItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">Completed:</p>
          <div className="flex flex-wrap gap-2">
            {completedItems.map((item) => (
              <div key={item.key} className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="w-3 h-3" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {completion === 100 && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <div className="inline-flex items-center gap-2 text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Profile Complete!</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Your profile is fully optimized to attract supporters
          </p>
        </div>
      )}
    </div>
  );
}
