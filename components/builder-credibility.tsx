import type { Profile } from '@/lib/supabase';
import { ExternalLink, Github, Shield, Award } from 'lucide-react';

interface BuilderCredibilityProps {
  profile: Profile;
}

export function BuilderCredibility({ profile }: BuilderCredibilityProps) {
  const hasAnyLinks = profile.github_username || profile.karma_gap_profile || profile.talent_protocol_profile;

  if (!hasAnyLinks) {
    return null;
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Builder Credibility</h3>
      
      <div className="space-y-3">
        {/* GitHub Username */}
        {profile.github_username && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm text-foreground">GitHub</span>
            </div>
            <a
              href={`https://github.com/${profile.github_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#FFBF00] hover:text-[#FFD700] flex items-center gap-1"
            >
              @{profile.github_username}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Karma GAP */}
        {profile.karma_gap_profile && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm text-foreground">Karma GAP</span>
            </div>
            <a
              href={profile.karma_gap_profile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#FFBF00] hover:text-[#FFD700] flex items-center gap-1"
            >
              View Profile
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Talent Protocol */}
        {profile.talent_protocol_profile && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm text-foreground">Talent Protocol</span>
            </div>
            <a
              href={profile.talent_protocol_profile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#FFBF00] hover:text-[#FFD700] flex items-center gap-1"
            >
              View Profile
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {profile.verified && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Shield className="h-4 w-4" />
            <span>Verified Builder</span>
          </div>
        </div>
      )}
    </div>
  );
}
