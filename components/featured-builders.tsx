'use client';

import { BuilderCard } from '@/components/builder-card';
import type { Profile } from '@/lib/supabase';

interface FeaturedBuildersProps {
  builders: (Profile & { total_received?: number })[];
}

/**
 * Client component wrapper for featured builders to prevent hydration mismatches
 * This ensures consistent rendering between server and client
 */
export function FeaturedBuilders({ builders }: FeaturedBuildersProps) {
  if (!builders || builders.length === 0) {
    return null;
  }

  return (
    <section className="bg-zinc-50 py-16 dark:bg-zinc-900 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Featured Builders</h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Top builders by total support received
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {builders.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} showStats={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
