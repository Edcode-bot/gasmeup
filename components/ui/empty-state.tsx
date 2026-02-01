import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  icon, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          {icon}
        </div>
      )}
      
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      
      {description && (
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  )
}

// Simple SVG icons for empty states
export function EmptyProjectsIcon() {
  return (
    <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

export function EmptyPostsIcon() {
  return (
    <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  )
}

export function EmptySupportersIcon() {
  return (
    <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
