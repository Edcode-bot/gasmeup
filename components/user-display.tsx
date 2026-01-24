'use client';

import { useState, useEffect } from 'react';
import { getUserProfile, UserProfile, formatAddress, getDisplayName } from '@/lib/user-utils';
import { Tooltip } from './tooltip';

interface UserDisplayProps {
  address: string;
  showAvatar?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UserDisplay({ 
  address, 
  showAvatar = true, 
  className = '',
  size = 'md' 
}: UserDisplayProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!address) return;
      
      setLoading(true);
      const userProfile = await getUserProfile(address);
      setProfile(userProfile);
      setLoading(false);
    }

    fetchProfile();
  }, [address]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showAvatar && (
          <div className={`${sizeClasses[size]} bg-gray-300 rounded-full animate-pulse`} />
        )}
        <span className={`${sizeClasses[size]} text-gray-400`}>Loading...</span>
      </div>
    );
  }

  const displayName = getDisplayName(profile, address);
  const hasUsername = profile?.username;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatar && (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#FFBF00] to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {displayName.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}
      
      <Tooltip content={address} className={hasUsername ? '' : ''}>
        <span className={`${sizeClasses[size]} font-medium ${hasUsername ? 'text-black dark:text-white' : 'text-gray-500'}`}>
          {hasUsername ? `@${displayName}` : displayName}
        </span>
      </Tooltip>
    </div>
  );
}
