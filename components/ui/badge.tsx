import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

export function Badge({ 
  variant = 'default', 
  size = 'md', 
  children, 
  className = '' 
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-300 dark:border-zinc-800';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs font-medium';
      case 'lg':
        return 'px-3 py-1.5 text-sm font-medium';
      default:
        return 'px-2.5 py-1 text-xs font-medium';
    }
  };

  return (
    <span className={`
      inline-flex items-center rounded-full border
      ${getVariantStyles()}
      ${getSizeStyles()}
      ${className}
    `}>
      {children}
    </span>
  );
}
