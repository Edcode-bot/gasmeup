'use client';

import { useState, useEffect } from 'react';
import { LandingNavbar } from '@/components/landing-navbar';
import { ProjectCard } from '@/components/project-card';
import { supabaseClient } from '@/lib/supabase-client';
import type { Project, Profile } from '@/lib/supabase';
import { usePrivy } from '@privy-io/react-auth';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

type SortOption = 'recent' | 'funded' | 'almost_funded';
type ProgressFilter = 'all' | '0-25' | '25-50' | '50-75' | '75-100' | '100+';

export default function ProjectsPage() {
  const { ready, authenticated } = usePrivy();
  const [projects, setProjects] = useState<(Project & { builder?: Profile | null })[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<(Project & { builder?: Profile | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [page, setPage] = useState(1);
  const projectsPerPage = 20;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchQuery, statusFilter, progressFilter, sortBy]);

  const fetchProjects = async () => {
    const client = supabaseClient;
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      const { data: projectsData, error } = await client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch builder profiles
      const builderAddresses = [...new Set(projectsData?.map((p) => p.builder_address) || [])];
      const { data: profilesData } = await client
        .from('profiles')
        .select('*')
        .in('wallet_address', builderAddresses);

      const profileMap = new Map(
        profilesData?.map((p) => [p.wallet_address.toLowerCase(), p]) || []
      );

      const projectsWithBuilder = (projectsData || []).map((project) => ({
        ...project,
        builder: profileMap.get(project.builder_address.toLowerCase()) || null,
      }));

      setProjects(projectsWithBuilder);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (project: Project): number => {
    if (!project.goal_amount || project.goal_amount === 0) return 0;
    return Math.min((Number(project.raised_amount) / Number(project.goal_amount)) * 100, 100);
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.builder?.username?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Progress filter
    if (progressFilter !== 'all') {
      filtered = filtered.filter((p) => {
        const progress = getProgressPercentage(p);
        switch (progressFilter) {
          case '0-25':
            return progress >= 0 && progress < 25;
          case '25-50':
            return progress >= 25 && progress < 50;
          case '50-75':
            return progress >= 50 && progress < 75;
          case '75-100':
            return progress >= 75 && progress < 100;
          case '100+':
            return progress >= 100;
          default:
            return true;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'funded':
        filtered.sort((a, b) => Number(b.raised_amount) - Number(a.raised_amount));
        break;
      case 'almost_funded':
        filtered.sort((a, b) => {
          const aProgress = getProgressPercentage(a);
          const bProgress = getProgressPercentage(b);
          if (aProgress >= 100) return 1;
          if (bProgress >= 100) return -1;
          return bProgress - aProgress;
        });
        break;
    }

    setFilteredProjects(filtered);
    setPage(1);
  };

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * projectsPerPage,
    page * projectsPerPage
  );
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Explore Projects</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
              Discover and fund amazing projects from builders
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4 sm:mb-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search projects by title, description, or builder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pl-10 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={progressFilter}
                  onChange={(e) => setProgressFilter(e.target.value as ProgressFilter)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="all">All Progress</option>
                  <option value="0-25">0-25%</option>
                  <option value="25-50">25-50%</option>
                  <option value="50-75">50-75%</option>
                  <option value="75-100">75-100%</option>
                  <option value="100+">100%+</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="recent">Recently Added</option>
                  <option value="funded">Most Funded</option>
                  <option value="almost_funded">Almost Funded</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Showing {paginatedProjects.length} of {filteredProjects.length} projects
            </p>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">Loading projects...</p>
            </div>
          ) : paginatedProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">
                {searchQuery || statusFilter !== 'all' || progressFilter !== 'all'
                  ? 'No projects found matching your filters.'
                  : 'No projects yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} showBuilder={true} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
