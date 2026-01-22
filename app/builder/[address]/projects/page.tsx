import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { ProjectCard } from '@/components/project-card';
import type { Project, Profile } from '@/lib/supabase';

interface BuilderProjectsPageProps {
  params: Promise<{ address: string }>;
}

export default async function BuilderProjectsPage({ params }: BuilderProjectsPageProps) {
  const { address } = await params;

  // Fetch builder profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('wallet_address', address.toLowerCase())
    .single();

  // Fetch builder's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('builder_address', address.toLowerCase())
    .order('created_at', { ascending: false });

  const projectsWithBuilder = (projects || []).map((project) => ({
    ...project,
    builder: profile || null,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              {profile?.username || formatAddress(address)}'s Projects
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
              Projects by this builder
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800 sm:mb-8">
            <div className="flex gap-4">
              <Link
                href={`/builder/${address}`}
                className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-foreground dark:text-zinc-400 dark:hover:border-zinc-700"
              >
                Contributions
              </Link>
              <Link
                href={`/builder/${address}/updates`}
                className="border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-foreground dark:text-zinc-400 dark:hover:border-zinc-700"
              >
                Updates
              </Link>
              <Link
                href={`/builder/${address}/projects`}
                className="border-b-2 border-[#FFBF00] px-1 pb-3 text-sm font-medium text-foreground"
              >
                Projects
              </Link>
            </div>
          </div>

          {/* Projects Grid */}
          {projectsWithBuilder.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">No projects yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projectsWithBuilder.map((project) => (
                <ProjectCard key={project.id} project={project} showBuilder={false} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
