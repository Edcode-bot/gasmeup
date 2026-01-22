'use client';

import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-12 w-12 text-lg',
  md: 'h-16 w-16 text-2xl',
  lg: 'h-24 w-24 text-3xl',
};

export function Avatar({ src, alt, fallback, size = 'md' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-full bg-[#FFBF00] font-bold text-black`}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover`}
      onError={() => setImageError(true)}
    />
  );
}

