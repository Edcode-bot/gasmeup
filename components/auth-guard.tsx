'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that protects routes by checking authentication
 * Redirects to landing page if not authenticated
 */
export function AuthGuard({ children, redirectTo = '/' }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, authenticated } = usePrivy();

  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      // Store the intended destination to redirect after login
      if (pathname && pathname !== redirectTo) {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      router.push(redirectTo);
    }
  }, [ready, authenticated, router, pathname, redirectTo]);

  // Show loading state while checking auth
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FFBF00] border-r-transparent"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
