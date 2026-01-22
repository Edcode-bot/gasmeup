'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { ProjectCard } from '@/components/project-card';
import { supabaseClient } from '@/lib/supabase-client';
import type { Project, Profile } from '@/lib/supabase';
import { Plus, Package, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function DashboardProjects() {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const [projects, setProjects] = useState<(Project & { builder?: Profile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalRaised: 0,
    totalSupporters: 0,
  });

  useEffect(() => {
    if (!authenticated || !user?.wallet?.address) {
      router.push('/');
      return;
    }

    fetchProjects();
  }, [authenticated, user?.wallet?.address, router]);

  const fetchProjects = async () => {
    if (!user?.wallet?.address) return;

    setLoading(true);
    try {
      const client = supabaseClient;
      if (!client) return;

      // Fetch builder's projects
      const { data: projectsData, error: projectsError } = await client
        .from('projects')
        .select('*')
        .eq('builder_address', user.wallet.address.toLowerCase())
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch builder profile
      const { data: profileData } = await client
        .from('profiles')
        .select('*')
        .eq('wallet_address', user.wallet.address.toLowerCase())
        .single();

      const projectsWithBuilder = (projectsData || []).map((project) => ({
        ...project,
        builder: profileData || null,
      }));

      setProjects(projectsWithBuilder);

      // Calculate stats
      const totalProjects = projectsData?.length || 0;
      const activeProjects =
        projectsData?.filter((p) => p.status === 'active').length || 0;
      const totalRaised =
        projectsData?.reduce((sum, p) => sum + Number(p.raised_amount || 0), 0) || 0;

      // Get unique supporters across all projects
      const projectIds = projectsData?.map((p) => p.id) || [];
      let totalSupporters = 0;
      if (projectIds.length > 0) {
        const { count } = await client
          .from('supports')
          .select('from_address', { count: 'exact', head: true })
          .in('project_id', projectIds)
          .not('project_id', 'is', null);
        totalSupporters = count || 0;
      }

      setStats({
        totalProjects,
        activeProjects,
        totalRaised,
        totalSupporters,
      });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">My Projects</h1>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[#FFBF00] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#FFD700] sm:px-6 sm:py-3 sm:text-base"
            >
              <Plus className="h-4 w-4" />
              Add New Project
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#FFBF00]/10 p-2">
                  <Package className="h-5 w-5 text-[#FFBF00]" />
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Projects</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalProjects}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Projects</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeProjects}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Raised</p>
                  <p className="text-2xl font-bold text-foreground">${stats.totalRaised.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Project Supporters</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalSupporters}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <Package className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                No projects yet
              </h3>
              <p className="mb-6 text-zinc-600 dark:text-zinc-400">
                Showcase your projects and get funded
              </p>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[#FFBF00] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#FFD700]"
              >
                <Plus className="h-4 w-4" />
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="relative">
                  <ProjectCard project={project} showBuilder={false} />
                  <div className="absolute right-2 top-2 flex gap-2 sm:right-4 sm:top-4">
                    <Link
                      href={`/dashboard/projects/edit/${project.id}`}
                      className="rounded bg-white/90 px-2 py-1 text-xs font-semibold text-zinc-900 shadow-sm hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
