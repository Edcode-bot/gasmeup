import type { Project } from '@/lib/supabase';
import { Target, Gift, PieChart, Info } from 'lucide-react';

interface FundingInfoProps {
  project: Project;
}

export function FundingInfo({ project }: FundingInfoProps) {
  return (
    <div className="space-y-6">
      {/* Funding Reason */}
      {project.funding_reason && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-2 font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-[#FFBF00]" />
            Why fund this milestone?
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {project.funding_reason}
          </p>
        </div>
      )}

      {/* Funding Goal Progress */}
      {project.funding_goal && project.funding_goal > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-[#FFBF00]" />
            Funding Target
          </h3>
          <div className="mb-2">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
              <span className="font-semibold text-foreground">
                {Math.min((Number(project.raised_amount) / Number(project.funding_goal)) * 100, 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full bg-[#FFBF00] transition-all"
                style={{
                  width: `${Math.min((Number(project.raised_amount) / Number(project.funding_goal)) * 100, 100)}%`
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>${Number(project.raised_amount).toFixed(2)} raised</span>
              <span>${Number(project.funding_goal).toFixed(2)} target</span>
            </div>
          </div>
        </div>
      )}

      {/* Supporter Perks */}
      {project.supporter_perks && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-2 font-semibold text-foreground flex items-center gap-2">
            <Gift className="h-4 w-4 text-[#FFBF00]" />
            Supporters Get
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {project.supporter_perks}
          </p>
        </div>
      )}

      {/* Funds Usage */}
      {(project.funds_usage_dev || project.funds_usage_infra || project.funds_usage_ops) && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-semibold text-foreground flex items-center gap-2">
            <PieChart className="h-4 w-4 text-[#FFBF00]" />
            How Funds Will Be Used
          </h3>
          <div className="space-y-2">
            {project.funds_usage_dev && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  <strong>Development:</strong> {project.funds_usage_dev}
                </span>
              </div>
            )}
            {project.funds_usage_infra && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  <strong>Infrastructure:</strong> {project.funds_usage_infra}
                </span>
              </div>
            )}
            {project.funds_usage_ops && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  <strong>Operations:</strong> {project.funds_usage_ops}
                </span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-start gap-2">
            <Info className="h-3 w-3 text-zinc-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              This is a breakdown of how the builder plans to use the funds. Actual usage may vary.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
