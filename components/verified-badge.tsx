'use client';

import { CheckCircle2 } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export function VerifiedBadge({ size = 'md', className = '', showTooltip = true }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <span
      className={`inline-flex items-center text-[#FFBF00] ${className}`}
      title={showTooltip ? 'Verified Builder' : undefined}
    >
      <CheckCircle2 className={sizeClasses[size]} fill="currentColor" />
    </span>
  );
}
