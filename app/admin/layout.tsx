'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { isAdmin } from '@/lib/admin';
import { AdminNavbar } from '@/components/admin-navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  
  useEffect(() => {
    if (!ready) return;

    if (!authenticated) {
      router.push('/');
      return;
    }

    if (!isAdmin(user?.wallet?.address)) {
      router.push('/');
      return;
    }
  }, [ready, authenticated, user?.wallet?.address, router]);

  if (!ready || !authenticated || !isAdmin(user?.wallet?.address)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          {!authenticated ? 'Connecting...' : 'Access Denied'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNavbar />
      {children}
    </div>
  );
}
