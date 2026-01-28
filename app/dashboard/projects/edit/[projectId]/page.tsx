'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { supabaseClient } from '@/lib/supabase-client';
import type { Project } from '@/lib/supabase';
import Image from 'next/image';
import { ArrowLeft, Save, Trash2, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { ready, authenticated, user } = usePrivy();
  const [projectId, setProjectId] = useState<string>('');
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');
  const [imageInputMethod, setImageInputMethod] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ raised: 0, supporters: 0 });

  const walletAddress = user?.wallet?.address?.toLowerCase();

  useEffect(() => {
    if (params?.projectId) {
      setProjectId(Array.isArray(params.projectId) ? params.projectId[0] : params.projectId);
    }
  }, [params]);

  useEffect(() => {
    if (!ready || !authenticated || !walletAddress || !projectId || !supabaseClient) {
      if (ready && !authenticated) {
        router.push('/');
      }
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      const client = supabaseClient;
      if (!client) return;

      try {
        const { data, error } = await client
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('builder_address', walletAddress)
          .single();

        if (error) throw error;

        if (data) {
          setProject(data);
          setTitle(data.title);
          setDescription(data.description);
          setImageUrl(data.image_url);
          setLiveUrl(data.live_url || '');
          setGithubUrl(data.github_url || '');
          setGoalAmount(data.goal_amount ? data.goal_amount.toString() : '');
          setStatus(data.status);
          setStats({ raised: Number(data.raised_amount || 0), supporters: 0 });

          // Fetch supporter count
          const { count } = await client
            .from('supports')
            .select('from_address', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .not('project_id', 'is', null);
          setStats((prev) => ({ ...prev, supporters: count || 0 }));
        } else {
          setError('Project not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch project:', err);
        setError('Failed to load project. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [ready, authenticated, walletAddress, projectId, router]);

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
      
      // Check if user is authenticated
      console.log('🔐 Checking authentication status...');
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      
      console.log('🔐 Session check:', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        userId: session?.user?.id
      });
      
      if (!session) {
        throw new Error('You must be logged in to upload images');
      }
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName; // Just the filename, not the full path
      
      console.log('📤 Attempting upload:', {
        bucket: 'project-images',
        path: filePath,
        size: file.size,
        type: file.type,
        fileName: fileName
      });
      
      const { data: uploadData, error: uploadError } = await client.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      console.log('📊 Upload result:', {
        success: !!uploadData,
        error: uploadError?.message,
        errorDetails: uploadError,
        uploadData: uploadData
      });
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = client.storage
        .from('project-images')
        .getPublicUrl(filePath);
      
      console.log('🔗 Public URL generated:', {
        url: urlData.publicUrl,
        path: filePath
      });
      
      setUploadedImage(urlData.publicUrl);
      setImageUrl(''); // Clear URL input when using upload
      setError('');
      
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setError(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getFinalImageUrl = (): string => {
    return imageInputMethod === 'url' ? imageUrl : uploadedImage;
  };

  const handleUpdate = async () => {
    if (!authenticated || !walletAddress || !supabaseClient || !projectId) {
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

    setSaving(true);
    setError('');
    const client = supabaseClient;

    try {
      const { error: updateError } = await client
        .from('projects')
        .update({
          title: title.trim(),
          description: description.trim(),
          image_url: finalImageUrl.trim(),
          live_url: liveUrl.trim() || null,
          github_url: githubUrl.trim() || null,
          goal_amount: goalAmount ? parseFloat(goalAmount) : null,
          status,
        })
        .eq('id', projectId)
        .eq('builder_address', walletAddress);

      if (updateError) throw updateError;

      router.push('/dashboard/projects');
    } catch (err: any) {
      console.error('Failed to update project:', err);
      setError(err?.message || 'Failed to update project. Please try again.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    if (!supabaseClient || !projectId || !walletAddress) return;

    const client = supabaseClient;
    setSaving(true);

    try {
      const { error } = await client
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('builder_address', walletAddress);

      if (error) throw error;

      router.push('/dashboard/projects');
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setError(err?.message || 'Failed to delete project. Please try again.');
      setSaving(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardNavbar />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">Project not found</h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              {error || 'The project you are looking for does not exist.'}
            </p>
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="min-h-[44px] rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Back to Projects
            </button>
          </div>
        </main>
      </div>
    );
  }

  const progressPercentage = project.goal_amount
    ? Math.min((stats.raised / Number(project.goal_amount)) * 100, 100)
    : 0;

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

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Edit Project</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
              Update your project details
            </p>
          </div>

          {/* Funding Stats */}
          <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Funding Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Raised</p>
                <p className="text-2xl font-bold text-foreground">${stats.raised.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Supporters</p>
                <p className="text-2xl font-bold text-foreground">{stats.supporters}</p>
              </div>
            </div>
            {project.goal_amount && project.goal_amount > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
                  <span className="font-semibold text-foreground">
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full bg-[#FFBF00] transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              Note: Funding stats are auto-calculated and cannot be edited manually.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-300">{error}</p>
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
                onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'archived')}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <div className="flex gap-4">
                <button
                  onClick={handleUpdate}
                  disabled={saving || !title.trim() || !description.trim()}
                  className="flex items-center gap-2 rounded-lg bg-[#FFBF00] px-6 py-3 font-semibold text-black transition-colors hover:bg-[#FFD700] disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Updating...' : 'Update Project'}
                </button>
                <button
                  onClick={() => router.back()}
                  className="rounded-lg border border-zinc-300 px-6 py-3 font-semibold text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-red-300 px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete Project
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
