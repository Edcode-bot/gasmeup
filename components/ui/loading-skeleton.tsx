import { ReactNode } from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'stat' | 'avatar';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ 
  type = 'card', 
  count = 1, 
  className = ''
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-zinc-200 rounded w-3/4 dark:bg-zinc-700"></div>
              <div className="h-3 bg-zinc-200 rounded w-1/2 dark:bg-zinc-700"></div>
              <div className="h-3 bg-zinc-200 rounded w-full dark:bg-zinc-700"></div>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className="flex items-center gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="animate-pulse">
              <div className="h-10 w-10 bg-zinc-200 rounded-full dark:bg-zinc-700"></div>
            </div>
            <div className="flex-1 animate-pulse space-y-2">
              <div className="h-4 bg-zinc-200 rounded w-1/3 dark:bg-zinc-700"></div>
              <div className="h-3 bg-zinc-200 rounded w-1/4 dark:bg-zinc-700"></div>
            </div>
          </div>
        );
      
      case 'stat':
        return (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-zinc-200 rounded w-1/2 dark:bg-zinc-700"></div>
              <div className="h-8 bg-zinc-200 rounded w-2/3 dark:bg-zinc-700"></div>
            </div>
          </div>
        );
      
      case 'avatar':
        return (
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-zinc-200 rounded-full dark:bg-zinc-700"></div>
          </div>
        );
      
      default:
        return (
          <div className="animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-full dark:bg-zinc-700"></div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={type === 'card' || type === 'stat' ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}
