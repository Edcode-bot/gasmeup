'use client';

import { Share2, Copy, ExternalLink } from 'lucide-react';
import { CopyButton } from './copy-button';
import { useToast } from './toast';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export function ShareButton({ 
  title, 
  text, 
  url, 
  className = '',
  variant = 'default'
}: ShareButtonProps) {
  const { success } = useToast();

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url
        });
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(url);
        success('Profile link copied to clipboard!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleNativeShare}
        className={`
          inline-flex items-center gap-2 rounded-lg border border-zinc-300 
          px-3 py-2 text-sm font-medium text-zinc-600 transition-colors 
          hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800
          ${className}
        `}
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleNativeShare}
        className={`
          inline-flex items-center justify-center gap-2 rounded-full bg-[#FFBF00] 
          px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90
          ${className}
        `}
      >
        <Share2 className="w-4 h-4" />
        Share Profile
      </button>
      
      <div className="flex gap-2">
        <CopyButton 
          text={url}
          size="sm"
          className="flex-1"
        >
          <Copy className="w-3 h-3" />
          Copy Link
        </CopyButton>
        
        <a
          href={`https://warpcast.com/~/compose?text=${encodeURIComponent(text + ' ' + url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <ExternalLink className="w-3 h-3" />
          Farcaster
        </a>
      </div>
    </div>
  );
}

// Specialized share components
export function ShareProfile({ username, address, className }: { 
  username?: string; 
  address: string; 
  className?: string;
}) {
  const profileUrl = username 
    ? `https://gasmeup-sable.vercel.app/@${username}`
    : `https://gasmeup-sable.vercel.app/builder/${address}`;
  const displayName = username || `builder`;
  
  return (
    <ShareButton
      title={`Support ${displayName} on GasMeUp`}
      text={`Check out @${displayName} on GasMeUp - Fund builders on Base and Celo! 🚀`}
      url={profileUrl}
      className={className}
    />
  );
}

export function ShareOnFarcaster({ text, url, className }: { 
  text: string; 
  url: string; 
  className?: string;
}) {
  const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text + ' ' + url)}`;
  
  return (
    <a
      href={farcasterUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        inline-flex items-center gap-2 rounded-lg border border-zinc-300 
        px-4 py-2 text-sm font-medium text-zinc-600 transition-colors 
        hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800
        ${className}
      `}
    >
      <Share2 className="w-4 h-4" />
      Share on Farcaster
    </a>
  );
}
