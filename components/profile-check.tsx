'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { supabaseClient } from '@/lib/supabase-client';
import { isAdmin } from '@/lib/admin';

interface ProfileCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that checks if authenticated user has a profile
 * and redirects to profile creation if they don't
 * Also blocks admin wallets from accessing builder features
 */
export function ProfileCheck({ children, redirectTo = '/dashboard/profile' }: ProfileCheckProps) {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const walletAddress = user?.wallet?.address?.toLowerCase();

  useEffect(() => {
    if (!ready || !authenticated || !walletAddress || !supabaseClient) {
      return;
    }

    // Check if user is admin - if so, redirect to admin panel
    if (isAdmin(walletAddress)) {
      router.push('/admin');
      return;
    }

    const checkProfile = async () => {
      const client = supabaseClient;
      if (!client) return;
      
      try {
        const { data, error } = await client
          .from('profiles')
          .select('wallet_address')
          .eq('wallet_address', walletAddress)
          .single();

        // If no profile found, redirect to profile creation
        if (error && error.code === 'PGRST116') {
          router.push(redirectTo);
        }
      } catch (err) {
        console.error('Error checking profile:', err);
      }
    };

    checkProfile();
  }, [ready, authenticated, walletAddress, router, redirectTo]);

  // Don't render children until we've checked (or if not authenticated)
  if (!ready || !authenticated) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

