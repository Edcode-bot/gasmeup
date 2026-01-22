'use client';

import { useState } from 'react';
import { Settings, DollarSign, Users, Wrench } from 'lucide-react';

export default function AdminSettingsPage() {
  const [platformFee, setPlatformFee] = useState(3);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    // TODO: Implement settings save to database
    alert('Settings saved! (Note: This is a placeholder - implement database persistence)');
  };

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Platform Settings</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Configure platform fees, features, and maintenance mode
          </p>
        </div>

        <div className="space-y-6">
          {/* Platform Fee */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-[#FFBF00]/10 p-2">
                <DollarSign className="h-5 w-5 text-[#FFBF00]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Platform Fee</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Adjust the percentage fee charged on all contributions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={platformFee}
                onChange={(e) => setPlatformFee(parseFloat(e.target.value) || 0)}
                className="w-24 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">%</span>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                Builders receive {100 - platformFee}% of contributions
              </p>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900">
                <Wrench className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Maintenance Mode</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Temporarily disable the platform for maintenance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#FFBF00] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFBF00]/20 dark:border-zinc-600 dark:bg-zinc-700"></div>
              </label>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {maintenanceMode ? 'Maintenance mode is ON' : 'Maintenance mode is OFF'}
              </span>
            </div>
          </div>

          {/* Featured Builders */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Featured Builders</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Manually select featured builders or use automatic selection
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-zinc-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#FFBF00] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFBF00]/20 dark:border-zinc-600 dark:bg-zinc-700"></div>
              </label>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Automatic selection (top builders by total raised)
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-lg bg-[#FFBF00] px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
