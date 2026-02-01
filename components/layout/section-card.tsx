import { ReactNode } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({ 
  title, 
  description, 
  action, 
  children, 
  className = '',
  contentClassName = ''
}: SectionCardProps) {
  return (
    <Card className={className}>
      {(title || description || action) && (
        <CardHeader 
          title={title}
          subtitle={description}
          action={action}
        />
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}
