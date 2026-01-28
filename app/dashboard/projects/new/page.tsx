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
const MAX_WHAT_BUILDING_LENGTH = 140;

export default function NewProjectPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whatBuilding, setWhatBuilding] = useState('');
  const [fundingReason, setFundingReason] = useState('');
  const [fundingGoal, setFundingGoal] = useState('');
  const [supporterPerks, setSupporterPerks] = useState('');
  const [fundsUsageDev, setFundsUsageDev] = useState('');
  const [fundsUsageInfra, setFundsUsageInfra] = useState('');
  const [fundsUsageOps, setFundsUsageOps] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [imageInputMethod, setImageInputMethod] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [status, setStatus] = useState<'idea' | 'building' | 'live' | 'active' | 'completed' | 'archived'>('idea');
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      const client = supabaseClient;
      if (!client) throw new Error('Supabase client not initialized');
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `project-images/${fileName}`;
      
      const { error: uploadError } = await client.storage
        .from('project-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = client.storage
        .from('project-images')
        .getPublicUrl(filePath);
      
      setUploadedImage(data.publicUrl);
      setImageUrl(''); // Clear URL input when using upload
      setError('');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getFinalImageUrl = (): string => {
    return imageInputMethod === 'url' ? imageUrl : uploadedImage;
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

    if (!whatBuilding.trim()) {
      setError('What I\'m building is required');
      return;
    }

    if (whatBuilding.length > MAX_WHAT_BUILDING_LENGTH) {
      setError(`What I'm building must be ${MAX_WHAT_BUILDING_LENGTH} characters or less`);
      return;
    }

    if (!fundingReason.trim()) {
      setError('Funding reason is required');
      return;
    }

    const finalImageUrl = getFinalImageUrl();
    if (!finalImageUrl.trim()) {
      setError('Project image is required');
      return;
    }

    if (imageInputMethod === 'url' && !validateUrl(finalImageUrl)) {
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
          what_building: whatBuilding.trim(),
          funding_reason: fundingReason.trim(),
          funding_goal: fundingGoal ? parseFloat(fundingGoal) : null,
          supporter_perks: supporterPerks.trim() || null,
          funds_usage_dev: fundsUsageDev.trim() || null,
          funds_usage_infra: fundsUsageInfra.trim() || null,
          funds_usage_ops: fundsUsageOps.trim() || null,
          image_url: finalImageUrl.trim(),
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

            {/* What I'm Building */}
            <div>
              <label htmlFor="whatBuilding" className="mb-2 block text-sm font-medium text-foreground">
                🚀 What I'm Building <span className="text-red-500">*</span>
              </label>
              <input
                id="whatBuilding"
                type="text"
                value={whatBuilding}
                onChange={(e) => setWhatBuilding(e.target.value)}
                maxLength={MAX_WHAT_BUILDING_LENGTH}
                placeholder="Building a decentralized social platform with AI-powered moderation"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {whatBuilding.length}/{MAX_WHAT_BUILDING_LENGTH} characters • Short description for project cards
              </p>
            </div>

            {/* Funding Reason */}
            <div>
              <label htmlFor="fundingReason" className="mb-2 block text-sm font-medium text-foreground">
                💰 Why fund this milestone? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="fundingReason"
                value={fundingReason}
                onChange={(e) => setFundingReason(e.target.value)}
                rows={3}
                placeholder="Cover infrastructure costs + ship feature X for 3 months of development"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
            </div>

            {/* Funding Goal */}
            <div>
              <label htmlFor="fundingGoal" className="mb-2 block text-sm font-medium text-foreground">
                🎯 Funding Target (USD, optional)
              </label>
              <input
                id="fundingGoal"
                type="number"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                placeholder="5000"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Informational target to show progress
              </p>
            </div>

            {/* Supporter Perks */}
            <div>
              <label htmlFor="supporterPerks" className="mb-2 block text-sm font-medium text-foreground">
                🎁 Supporters Get (optional)
              </label>
              <textarea
                id="supporterPerks"
                value={supporterPerks}
                onChange={(e) => setSupporterPerks(e.target.value)}
                rows={3}
                placeholder="Early access to beta&#10;Product credits&#10;Influence on roadmap&#10;Recognition as founding supporter"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
              />
            </div>

            {/* Funds Usage */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                📊 How Funds Will Be Used (optional)
              </label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="fundsUsageDev" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Development (%)
                  </label>
                  <input
                    id="fundsUsageDev"
                    type="text"
                    value={fundsUsageDev}
                    onChange={(e) => setFundsUsageDev(e.target.value)}
                    placeholder="60%"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
                  />
                </div>
                <div>
                  <label htmlFor="fundsUsageInfra" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Infrastructure (%)
                  </label>
                  <input
                    id="fundsUsageInfra"
                    type="text"
                    value={fundsUsageInfra}
                    onChange={(e) => setFundsUsageInfra(e.target.value)}
                    placeholder="25%"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
                  />
                </div>
                <div>
                  <label htmlFor="fundsUsageOps" className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Operations/Audit (%)
                  </label>
                  <input
                    id="fundsUsageOps"
                    type="text"
                    value={fundsUsageOps}
                    onChange={(e) => setFundsUsageOps(e.target.value)}
                    placeholder="15%"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
                  />
                </div>
              </div>
            </div>

            {/* Project Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Project Image <span className="text-red-500">*</span>
              </label>
              
              {/* Tab buttons to switch between URL and Upload */}
              <div className="flex gap-2 mb-4">
                <button 
                  type="button"
                  onClick={() => setImageInputMethod('url')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    imageInputMethod === 'url' 
                      ? 'bg-[#FFBF00] text-black' 
                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Image URL
                </button>
                <button 
                  type="button"
                  onClick={() => setImageInputMethod('upload')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    imageInputMethod === 'upload' 
                      ? 'bg-[#FFBF00] text-black' 
                      : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Upload File
                </button>
              </div>
              
              {/* Show URL input or file upload based on selection */}
              {imageInputMethod === 'url' ? (
                <div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setUploadedImage(''); // Clear uploaded image when switching to URL
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-400"
                  />
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#FFBF00] file:text-black hover:file:bg-[#FFD700] focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  {isUploading && (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                      Uploading image...
                    </p>
                  )}
                </div>
              )}
              
              {/* Preview */}
              {(getFinalImageUrl()) && (
                <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="relative h-64 w-full">
                    <Image
                      src={getFinalImageUrl()}
                      alt="Project image preview"
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
                onChange={(e) => setStatus(e.target.value as 'idea' | 'building' | 'live' | 'active' | 'completed' | 'archived')}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="idea">💡 Idea</option>
                <option value="building">🔨 Building</option>
                <option value="live">🚀 Live</option>
                <option value="active">✅ Active</option>
                <option value="completed">🎉 Completed</option>
                <option value="archived">📦 Archived</option>
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
