import { Plus, Share2, Users, FileText, ExternalLink } from 'lucide-react';
import { ShareProfile } from '@/components/share-button';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'no-supporters' | 'no-contributions' | 'no-posts' | 'no-projects' | 'no-builders';
  address?: string;
  username?: string;
  className?: string;
}

export function EmptyState({ type, address, username, className = '' }: EmptyStateProps) {
  const emptyStates = {
    'no-supporters': {
      icon: Users,
      title: 'No supporters yet',
      description: 'Share your profile to get started and attract supporters who believe in your work.',
      primaryAction: {
        label: 'Share Profile',
        component: address ? (
          <ShareProfile username={username} address={address} className="w-full" />
        ) : null
      },
      secondaryAction: null
    },
    'no-contributions': {
      icon: Plus,
      title: 'No contributions yet',
      description: 'Start supporting builders and help fund the future of Web3.',
      primaryAction: {
        label: 'Explore Builders',
        component: (
          <Link href="/explore">
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FFBF00] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90">
              <Users className="w-4 h-4" />
              Explore Builders
            </button>
          </Link>
        )
      },
      secondaryAction: null
    },
    'no-posts': {
      icon: FileText,
      title: 'No posts yet',
      description: 'Share your first update with your supporters and keep them engaged.',
      primaryAction: {
        label: 'Create First Update',
        component: (
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FFBF00] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90">
            <FileText className="w-4 h-4" />
            Create First Update
          </button>
        )
      },
      secondaryAction: {
        label: 'Learn More',
        component: (
          <a
            href="https://docs.gasmeup.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ExternalLink className="w-3 h-3" />
            Learn More
          </a>
        )
      }
    },
    'no-projects': {
      icon: Plus,
      title: 'No projects yet',
      description: 'Add a project to get funded and showcase your work to potential supporters.',
      primaryAction: {
        label: 'Add Project',
        component: (
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FFBF00] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90">
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        )
      },
      secondaryAction: {
        label: 'View Examples',
        component: (
          <Link href="/explore">
            <span className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              <Users className="w-3 h-3" />
              View Examples
            </span>
          </Link>
        )
      }
    },
    'no-builders': {
      icon: Users,
      title: 'No builders found',
      description: 'Be the first builder to join and start receiving support from the community.',
      primaryAction: {
        label: 'Create Profile',
        component: (
          <Link href="/dashboard">
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FFBF00] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90">
              <Plus className="w-4 h-4" />
              Create Profile
            </button>
          </Link>
        )
      },
      secondaryAction: {
        label: 'Learn More',
        component: (
          <a
            href="https://docs.gasmeup.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ExternalLink className="w-3 h-3" />
            Learn More
          </a>
        )
      }
    }
  };

  const state = emptyStates[type];
  const Icon = state.icon;

  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800 mb-4">
        <Icon className="w-8 h-8 text-zinc-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {state.title}
      </h3>
      
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
        {state.description}
      </p>
      
      <div className="w-full max-w-sm space-y-3">
        {state.primaryAction.component}
        {state.secondaryAction?.component}
      </div>
    </div>
  );
}

// Specialized empty state components
export function NoSupportersEmpty({ address, username, className }: { 
  address: string; 
  username?: string; 
  className?: string;
}) {
  return (
    <EmptyState 
      type="no-supporters" 
      address={address} 
      username={username}
      className={className}
    />
  );
}

export function NoContributionsEmpty({ className }: { className?: string }) {
  return <EmptyState type="no-contributions" className={className} />;
}

export function NoPostsEmpty({ className }: { className?: string }) {
  return <EmptyState type="no-posts" className={className} />;
}

export function NoProjectsEmpty({ className }: { className?: string }) {
  return <EmptyState type="no-projects" className={className} />;
}

export function NoBuildersEmpty({ className }: { className?: string }) {
  return <EmptyState type="no-builders" className={className} />;
}
