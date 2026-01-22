'use client';

import { Twitter, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';

interface SocialLinksProps {
  twitterUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SocialLinks({
  twitterUrl,
  githubUrl,
  linkedinUrl,
  size = 'md',
  className = '',
}: SocialLinksProps) {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;
  const gap = size === 'sm' ? 'gap-2' : size === 'lg' ? 'gap-3' : 'gap-3';

  const links = [
    { url: twitterUrl, icon: Twitter, label: 'Twitter' },
    { url: githubUrl, icon: Github, label: 'GitHub' },
    { url: linkedinUrl, icon: Linkedin, label: 'LinkedIn' },
  ].filter((link) => link.url);

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {links.map(({ url, icon: Icon, label }) => (
        <Link
          key={label}
          href={url!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400 dark:hover:text-[#FFBF00]"
          aria-label={label}
        >
          <Icon size={iconSize} />
        </Link>
      ))}
    </div>
  );
}
