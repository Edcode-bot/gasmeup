'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { getBaseUrl } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function CopyButton({ 
  text, 
  className = '', 
  size = 'md',
  showIcon = true,
  children 
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-2 rounded-lg border border-zinc-300 
        text-zinc-600 transition-colors hover:bg-zinc-100 
        dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800
        ${sizeClasses[size]}
        ${className}
      `}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {showIcon && (
        copied ? (
          <Check className={iconSizes[size]} />
        ) : (
          <Copy className={iconSizes[size]} />
        )
      )}
      {children && (
        <span>{copied ? 'Copied!' : children}</span>
      )}
    </button>
  );
}

// Specialized copy components
export function CopyAddress({ address, className }: { address: string; className?: string }) {
  return (
    <CopyButton 
      text={address} 
      size="sm" 
      className={className}
    >
      Copy Address
    </CopyButton>
  );
}

export function CopyProfileUrl({ address, username, className }: { 
  address: string; 
  username?: string;
  className?: string;
}) {
  const baseUrl = getBaseUrl();
  const profileUrl = username 
    ? `${baseUrl}/@${username}`
    : `${baseUrl}/builder/${address}`;
  
  return (
    <CopyButton 
      text={profileUrl} 
      size="sm" 
      className={className}
    >
      Copy Profile Link
    </CopyButton>
  );
}

export function CopyTransactionHash({ txHash, className }: { txHash: string; className?: string }) {
  return (
    <CopyButton 
      text={txHash} 
      size="sm" 
      className={className}
      showIcon={true}
    />
  );
}
