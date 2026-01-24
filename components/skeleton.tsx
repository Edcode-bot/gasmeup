import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className, 
  variant = 'default', 
  width, 
  height, 
  lines = 1 
}: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-md',
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={{
              width: i === lines - 1 ? '75%' : '100%',
              height: height || '1rem'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 animate-pulse',
        variantClasses[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1.5rem'
      }}
    />
  );
}

// Predefined skeleton components
export function UserCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton width="40%" height={20} className="mb-2" />
          <Skeleton width="60%" height={16} />
        </div>
      </div>
      <Skeleton lines={2} className="mb-4" />
      <div className="flex justify-between">
        <Skeleton width="30%" height={16} />
        <Skeleton width="25%" height={20} />
      </div>
    </div>
  );
}

export function ContributionSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton width="30%" height={16} />
          </div>
          <Skeleton lines={1} className="mb-1" />
          <Skeleton width="20%" height={12} />
        </div>
        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
          <Skeleton width="25%" height={16} className="mb-1" />
          <Skeleton width="20%" height={12} />
        </div>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 sm:p-6 dark:border-zinc-800">
      <Skeleton width="60%" height={24} className="mb-2" />
      <Skeleton width="40%" height={36} />
    </div>
  );
}
