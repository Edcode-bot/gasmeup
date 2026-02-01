import { ReactNode } from 'react';

interface TwoColumnProps {
  main: ReactNode;
  aside: ReactNode;
  reverseOnMobile?: boolean;
  className?: string;
  mainClassName?: string;
  asideClassName?: string;
}

export function TwoColumn({ 
  main, 
  aside, 
  reverseOnMobile = false,
  className = '',
  mainClassName = '',
  asideClassName = ''
}: TwoColumnProps) {
  return (
    <div className={`grid gap-6 lg:grid-cols-3 ${reverseOnMobile ? 'lg:grid-flow-row-dense' : ''} ${className}`}>
      <div className={`lg:col-span-2 ${mainClassName}`}>
        {main}
      </div>
      <div className={`space-y-6 ${asideClassName}`}>
        {aside}
      </div>
    </div>
  );
}
