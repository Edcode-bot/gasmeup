'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { supabaseClient } from '@/lib/supabase-client';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;

export default function NewPostPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const walletAddress = user?.wallet?.address?.toLowerCase();

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!walletAddress) return;

    const draftKey = `post_draft_${walletAddress}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setImageUrl(draft.imageUrl || '');
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;

    const draftKey = `post_draft_${walletAddress}`;
    const timeoutId = setTimeout(() => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          title,
          content,
          imageUrl,
        })
      );
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content, imageUrl, walletAddress]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    // Accept any URL that starts with http:// or https://
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const handlePublish = async () => {
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

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Content must be ${MAX_CONTENT_LENGTH} characters or less`);
      return;
    }

    if (imageUrl && !validateUrl(imageUrl)) {
      setError('Please enter a valid image URL');
      return;
    }

    setSaving(true);
    setError('');
    const client = supabaseClient;

    try {
      const { error: insertError } = await client.from('posts').insert({
        builder_address: walletAddress,
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl.trim() || null,
      });

      if (insertError) throw insertError;

      // Clear draft
      const draftKey = `post_draft_${walletAddress}`;
      localStorage.removeItem(draftKey);

      router.push('/dashboard/posts');
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err?.message || 'Failed to create post. Please try again.');
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Create New Post</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
              Share an update with your supporters
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowPreview(false)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !showPreview
                  ? 'bg-[#FFBF00] text-black'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                showPreview
                  ? 'bg-[#FFBF00] text-black'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              Preview
            </button>
          </div>

          {!showPreview ? (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                  maxLength={MAX_TITLE_LENGTH}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {title.length}/{MAX_TITLE_LENGTH} characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your update..."
                  rows={12}
                  maxLength={MAX_CONTENT_LENGTH}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {content.length}/{MAX_CONTENT_LENGTH} characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageLoadError(false);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                />
                {imageUrl && validateUrl(imageUrl) && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-foreground">Preview:</p>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-64 w-full rounded-lg object-cover"
                      onError={() => setImageLoadError(true)}
                      onLoad={() => setImageLoadError(false)}
                    />
                    {imageLoadError && (
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                        ⚠️ Image failed to load. Please check the URL is correct and publicly accessible.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-2xl font-bold text-foreground">{title || 'Untitled'}</h2>
              {imageUrl && validateUrl(imageUrl) && (
                <img
                  src={imageUrl}
                  alt={title}
                  className="mb-4 w-full rounded-lg object-cover"
                />
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-zinc-600 dark:text-zinc-400">
                    {paragraph || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={handlePublish}
              disabled={saving || !title.trim() || !content.trim()}
              className="min-h-[44px] flex-1 rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
            <button
              onClick={() => router.back()}
              className="min-h-[44px] rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
