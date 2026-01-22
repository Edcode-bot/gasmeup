'use client';

interface ProfileCompletenessProps {
  username: string;
  bio: string;
  avatarUrl: string;
  twitterUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  walletAddress: string;
}

export function ProfileCompleteness({
  username,
  bio,
  avatarUrl,
  twitterUrl,
  githubUrl,
  linkedinUrl,
  walletAddress,
}: ProfileCompletenessProps) {
  const checks = [
    { label: 'Wallet', complete: !!walletAddress },
    { label: 'Username', complete: !!username && username.trim().length >= 3 },
    { label: 'Bio', complete: !!bio && bio.trim().length > 0 },
    { label: 'Avatar', complete: !!avatarUrl && avatarUrl.trim().length > 0 },
    { label: 'Social Links', complete: !!(twitterUrl || githubUrl || linkedinUrl) },
  ];

  const completedCount = checks.filter((c) => c.complete).length;
  const totalCount = checks.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const missingItems = checks
    .filter((c) => !c.complete)
    .map((c) => c.label)
    .slice(0, 2); // Show max 2 missing items

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Profile Completeness</span>
        <span className="text-sm font-semibold text-[#FFBF00]">{percentage}%</span>
      </div>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-[#FFBF00] transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {missingItems.length > 0 && (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Add {missingItems.join(' and ')} to reach {percentage < 100 ? 100 : percentage}%
        </p>
      )}
      {percentage === 100 && (
        <p className="text-xs text-green-600 dark:text-green-400">Profile complete! 🎉</p>
      )}
    </div>
  );
}
