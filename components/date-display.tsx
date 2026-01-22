'use client';

import { useEffect, useState } from 'react';

interface DateDisplayProps {
  date: string | Date;
  format?: 'short' | 'long' | 'iso';
  className?: string;
}

/**
 * Client component for consistent date formatting to prevent hydration mismatches
 */
export function DateDisplay({ date, format = 'short', className = '' }: DateDisplayProps) {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'iso') {
      setFormattedDate(dateObj.toISOString().split('T')[0]);
    } else if (format === 'long') {
      setFormattedDate(dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
    } else {
      setFormattedDate(dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }));
    }
  }, [date, format]);

  // Return a placeholder during SSR to match initial client render
  if (!formattedDate) {
    return <span className={className}>—</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}
