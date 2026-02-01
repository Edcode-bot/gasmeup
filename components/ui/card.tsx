import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200/60 bg-white/80 backdrop-blur-sm shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ 
  className, 
  children, 
  title, 
  subtitle, 
  action,
  ...props 
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 p-6 pb-4",
        action && "flex-row items-center justify-between space-y-0",
        className
      )}
      {...props}
    >
      {title && (
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children && !title && children}
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
}
