'use client';

import Link from 'next/link';
import { formatAddress } from '@/lib/utils';
import type { Project, Profile } from '@/lib/supabase';
import { Calendar, Users, Target } from 'lucide-react';

interface ProjectCardProps {
  project: Project & { builder?: Profile | null };
  showBuilder?: boolean;
  showFullDescription?: boolean;
}

export function ProjectCard({
  project,
  showBuilder = true,
  showFullDescription = false,
}: ProjectCardProps) {
  const progressPercentage = project.goal_amount
    ? Math.min((project.raised_amount / project.goal_amount) * 100, 100)
    : 0;
  
  const statusColors = {
    idea: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    building: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    live: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    archived: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white transition-all hover:border-[#FFBF00] hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-zinc-100 dark:bg-zinc-800 sm:h-56">
        <img
          src={project.image_url}
          alt={project.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute right-2 top-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusColors[project.status]}`}
          >
            {project.status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-[#FFBF00] transition-colors">
          {project.title}
        </h3>

        {project.what_building && (
          <div className="mb-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              🚀 {project.what_building}
            </p>
          </div>
        )}

        {showBuilder && project.builder && (
          <Link
            href={`/builder/${project.builder_address}`}
            onClick={(e) => e.stopPropagation()}
            className="mb-3 text-sm text-zinc-500 hover:text-[#FFBF00] dark:text-zinc-400"
          >
            by {project.builder.username || formatAddress(project.builder_address)}
          </Link>
        )}

        <p
          className={`mb-4 text-sm text-zinc-600 dark:text-zinc-400 ${
            showFullDescription ? '' : 'line-clamp-2'
          }`}
        >
          {project.description}
        </p>

        {project.goal_amount && project.goal_amount > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Funding Progress</span>
              <span className="font-semibold text-foreground">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full bg-[#FFBF00] transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>${project.raised_amount.toFixed(2)} raised</span>
              <span>${project.goal_amount.toFixed(2)} goal</span>
            </div>
          </div>
        )}

        {(!project.goal_amount || project.goal_amount === 0) && (
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <Target className="h-4 w-4" />
            <span className="font-semibold">${project.raised_amount.toFixed(2)} raised</span>
          </div>
        )}

        <div className="mt-auto flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
