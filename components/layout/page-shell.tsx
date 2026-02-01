import { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageShell({ 
  title, 
  subtitle, 
  actions, 
  children, 
  className = '' 
}: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex gap-3">
                {actions}
              </div>
            )}
          </div>
          
          {/* Page Content */}
          <div className={className}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
