'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

interface GetStartedButtonProps {
  className?: string;
}

export function GetStartedButton({ className }: GetStartedButtonProps) {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivy();

  const handleClick = async () => {
    if (!ready) return;
    
    if (authenticated) {
      // Already logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // Not logged in, trigger login modal
      await login();
    }
  };

  // Redirect to dashboard after successful login
  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  return (
    <button
      onClick={handleClick}
      disabled={!ready}
      className={className || "min-h-[44px] flex items-center justify-center rounded-full bg-[#FFBF00] px-6 py-3 text-base font-semibold text-black transition-all hover:opacity-90 hover:scale-105 shadow-lg shadow-[#FFBF00]/20 sm:px-8 sm:py-4 disabled:opacity-50"}
    >
      Get Started
    </button>
  );
}
