'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { ProjectCard } from '@/components/project-card';
import { Avatar } from '@/components/avatar';
import { SocialLinks } from '@/components/social-links';
import { VerifiedBadge } from '@/components/verified-badge';
import { CopyLinkButton } from '@/components/copy-link-button';
import { CommentSection } from '@/components/posts/comment-section';
import { formatAddress } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase-client';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import Image from 'next/image';
import type { Project, Profile, Support } from '@/lib/supabase';
import { ExternalLink, Github, ArrowLeft, Users, DollarSign, Target } from 'lucide-react';

export default function SingleProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const [projectId, setProjectId] = useState<string>('');
  const [project, setProject] = useState<(Project & { builder?: Profile | null }) | null>(null);
  const [recentContributors, setRecentContributors] = useState<(Support & { profile?: Profile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [supportersCount, setSupportersCount] = useState(0);

  useEffect(() => {
    if (params?.projectId) {
      setProjectId(Array.isArray(params.projectId) ? params.projectId[0] : params.projectId);
    }
  }, [params]);

  useEffect(() => {
    if (!projectId || !supabaseClient) return;

    const fetchProject = async () => {
      const client = supabaseClient;
      if (!client) return;

      try {
        // Fetch project
        const { data: projectData, error: projectError } = await client
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        if (!projectData) {
          setLoading(false);
          return;
        }

        // Fetch builder profile
        const { data: profileData } = await client
          .from('profiles')
          .select('*')
          .eq('wallet_address', projectData.builder_address.toLowerCase())
          .single();

        setProject({ ...projectData, builder: profileData || null });

        // Fetch recent contributors (last 10)
        const { data: supportsData } = await client
          .from('supports')
          .select('*')
          .eq('project_id', projectId)
          .not('project_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);

        // Get unique supporter addresses
        const supporterAddresses = [...new Set(supportsData?.map((s) => s.from_address) || [])];
        const { data: supporterProfiles } = await client
          .from('profiles')
          .select('*')
          .in('wallet_address', supporterAddresses);

        const profileMap = new Map(
          supporterProfiles?.map((p) => [p.wallet_address.toLowerCase(), p]) || []
        );

        const supportsWithProfiles = (supportsData || []).map((support) => ({
          ...support,
          profile: profileMap.get(support.from_address.toLowerCase()) || null,
        }));

        setRecentContributors(supportsWithProfiles);
        setSupportersCount(new Set(supporterAddresses).size);

        // Get total supporters count
        const { count } = await client
          .from('supports')
          .select('from_address', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .not('project_id', 'is', null);
        setSupportersCount(count || 0);
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const projectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/projects/${projectId}`
    : `https://gasmeup-sable.vercel.app/projects/${projectId}`;

  const progressPercentage = project?.goal_amount
    ? Math.min((Number(project.raised_amount) / Number(project.goal_amount)) * 100, 100)
    : 0;

  const NavComponent = ready && authenticated ? DashboardNavbar : Navbar;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavComponent />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-zinc-600 dark:text-zinc-400">Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavComponent />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">Project not found</h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              The project you are looking for does not exist.
            </p>
            <button
              onClick={() => router.push('/projects')}
              className="min-h-[44px] rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Back to Projects
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavComponent />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/projects"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-[#FFBF00] dark:text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Project Image */}
              <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800 sm:h-96">
                <Image
                  src={project.image_url}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>

              {/* Project Title and Actions */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
                    {project.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/builder/${project.builder_address}`}
                      className="text-zinc-600 hover:text-[#FFBF00] dark:text-zinc-400"
                    >
                      by {project.builder?.username || formatAddress(project.builder_address)}
                    </Link>
                    {project.builder?.verified && <VerifiedBadge size="sm" />}
                  </div>
                </div>
                <CopyLinkButton url={projectUrl} />
              </div>

              {/* Project Description */}
              <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-xl font-semibold text-foreground">About This Project</h2>
                <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
                  {project.description}
                </p>
              </div>

              {/* Links */}
              <div className="mb-6 flex flex-wrap gap-4">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Live Project
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                )}
              </div>

              {/* Comments Section */}
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-xl font-semibold text-foreground">Comments</h2>
                <CommentSection postId={projectId} builderAddress={project.builder_address} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Builder Info Card */}
              <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Builder</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar
                    src={project.builder?.avatar_url}
                    alt={project.builder?.username || 'Builder'}
                    fallback={project.builder?.username?.charAt(0).toUpperCase() || '?'}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/builder/${project.builder_address}`}
                        className="font-semibold text-foreground hover:text-[#FFBF00] truncate"
                      >
                        {project.builder?.username || formatAddress(project.builder_address)}
                      </Link>
                      {project.builder?.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 truncate">
                      {formatAddress(project.builder_address)}
                    </p>
                  </div>
                </div>
                {project.builder?.bio && (
                  <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {project.builder.bio}
                  </p>
                )}
                <SocialLinks
                  twitterUrl={project.builder?.twitter_url}
                  githubUrl={project.builder?.github_url}
                  linkedinUrl={project.builder?.linkedin_url}
                  size="sm"
                />
              </div>

              {/* Funding Section */}
              <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Funding</h3>
                
                {project.goal_amount && project.goal_amount > 0 ? (
                  <>
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
                        <span className="font-semibold text-foreground">
                          {progressPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className="h-full bg-[#FFBF00] transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>${Number(project.raised_amount).toFixed(2)} raised</span>
                        <span>${Number(project.goal_amount).toFixed(2)} goal</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#FFBF00]" />
                    <span className="text-2xl font-bold text-foreground">
                      ${Number(project.raised_amount).toFixed(2)}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">raised</span>
                  </div>
                )}

                <div className="mb-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Supporters</span>
                    <span className="font-semibold text-foreground">{supportersCount}</span>
                  </div>
                </div>

                <Link
                  href={`/projects/${projectId}/fund`}
                  className="block w-full rounded-lg bg-[#FFBF00] px-6 py-3 text-center font-semibold text-black transition-colors hover:bg-[#FFD700]"
                >
                  Fund This Project
                </Link>
              </div>

              {/* Recent Contributors */}
              {recentContributors.length > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Contributors</h3>
                  <div className="space-y-3">
                    {recentContributors.slice(0, 5).map((support) => (
                      <div
                        key={support.id}
                        className="flex items-center gap-3 border-b border-zinc-100 pb-3 last:border-0 dark:border-zinc-800"
                      >
                        <Avatar
                          src={support.profile?.avatar_url}
                          alt={support.profile?.username || 'Contributor'}
                          fallback={support.profile?.username?.charAt(0).toUpperCase() || '?'}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {support.profile?.username || formatAddress(support.from_address)}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500">
                            ${Number(support.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
