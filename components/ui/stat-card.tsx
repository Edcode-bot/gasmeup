import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  delta, 
  trend = 'neutral',
  className = ''
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600 dark:text-green-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      default: return 'text-zinc-600 dark:text-zinc-400';
    }
  };

  const getIconBackground = () => {
    if (!Icon) return '';
    switch (trend) {
      case 'up': return 'bg-green-100 dark:bg-green-900/20';
      case 'down': return 'bg-red-100 dark:bg-red-900/20';
      default: return 'bg-[#FFBF00]/10';
    }
  };

  const getIconColor = () => {
    if (!Icon) return '';
    switch (trend) {
      case 'up': return 'text-green-600 dark:text-green-400';
      case 'down': return 'text-red-600 dark:text-red-400';
      default: return 'text-[#FFBF00]';
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {label}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {value}
            </p>
            {delta && (
              <p className={`text-sm mt-1 ${getTrendColor()}`}>
                {delta}
              </p>
            )}
          </div>
          {Icon && (
            <div className={`rounded-full p-3 ${getIconBackground()}`}>
              <Icon className={`h-5 w-5 ${getIconColor()}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
