import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800",
        className
      )}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white/80 p-6 dark:border-zinc-800/60 dark:bg-zinc-900/80">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="group flex flex-col rounded-xl border border-zinc-200/60 bg-white/80 transition-all hover:border-[#FFBF00] hover:shadow-lg dark:border-zinc-800/60 dark:bg-zinc-900/80">
      <Skeleton className="h-48 w-full rounded-t-xl sm:h-56" />
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-3 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-5/6" />
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}
