'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { supabaseClient } from '@/lib/supabase-client';
import Image from 'next/image';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

export default function NewProjectPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const walletAddress = user?.wallet?.address?.toLowerCase();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCreate = async () => {
    if (!authenticated || !walletAddress || !supabaseClient) {
      setError('Please connect your wallet first');
      return;
    }

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > MAX_TITLE_LENGTH) {
      setError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
      return;
    }

    if (!imageUrl.trim()) {
      setError('Project image is required');
      return;
    }

    if (!validateUrl(imageUrl)) {
      setError('Invalid image URL');
      return;
    }

    if (liveUrl && !validateUrl(liveUrl)) {
      setError('Invalid live project URL');
      return;
    }

    if (githubUrl && !validateUrl(githubUrl)) {
      setError('Invalid GitHub URL');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const client = supabaseClient;
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error: insertError } = await client
        .from('projects')
        .insert({
          builder_address: walletAddress,
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl.trim(),
          live_url: liveUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          goal_amount: goalAmount ? parseFloat(goalAmount) : null,
          status,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push('/dashboard/projects');
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setError(err.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  if (!ready || !authenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/dashboard/projects"
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-[#FFBF00] dark:text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <h1 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">Create New Project</h1>

          {error && (
            <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-foreground">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={MAX_TITLE_LENGTH}
                placeholder="Enter project title"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {title.length}/{MAX_TITLE_LENGTH} characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={8}
                placeholder="Describe your project in detail..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {description.length}/{MAX_DESCRIPTION_LENGTH} characters
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="mb-2 block text-sm font-medium text-foreground">
                Project Image URL <span className="text-red-500">*</span>
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
              {imageUrl && validateUrl(imageUrl) && (
                <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="relative h-64 w-full">
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Live URL */}
            <div>
              <label htmlFor="liveUrl" className="mb-2 block text-sm font-medium text-foreground">
                Live Project URL (optional)
              </label>
              <input
                id="liveUrl"
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://yourproject.com"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label htmlFor="githubUrl" className="mb-2 block text-sm font-medium text-foreground">
                GitHub URL (optional)
              </label>
              <input
                id="githubUrl"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
            </div>

            {/* Goal Amount */}
            <div>
              <label htmlFor="goalAmount" className="mb-2 block text-sm font-medium text-foreground">
                Funding Goal (USD, optional)
              </label>
              <input
                id="goalAmount"
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="1000"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'archived')}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-[#FFBF00] px-6 py-3 font-semibold text-black transition-colors hover:bg-[#FFD700] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
