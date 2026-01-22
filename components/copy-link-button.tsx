'use client';

import { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  url: string;
  className?: string;
}

export function CopyLinkButton({ url, className = '' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-[#FFBF00] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-[#FFBF00] ${className}`}
      aria-label="Copy profile link"
      title="Copy profile link"
    >
      {copied ? (
        <>
          <Check size={20} className="text-green-600 dark:text-green-400" />
          <span className="ml-2 text-xs text-green-600 dark:text-green-400">Copied!</span>
        </>
      ) : (
        <LinkIcon size={20} />
      )}
    </button>
  );
}
