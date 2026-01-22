'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import { PostCard } from '@/components/posts/post-card';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase-client';
import type { Post } from '@/lib/supabase';

export default function PostsPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalEngagement: 0,
  });

  const walletAddress = user?.wallet?.address?.toLowerCase();

  useEffect(() => {
    if (!ready || !authenticated || !walletAddress || !supabaseClient) {
      if (ready && !authenticated) {
        router.push('/');
      }
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      const client = supabaseClient;
      if (!client) return;

      try {
        const { data, error } = await client
          .from('posts')
          .select('*')
          .eq('builder_address', walletAddress)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setPosts(data);
          const totalLikes = data.reduce((sum, post) => sum + post.likes_count, 0);
          const totalComments = data.reduce((sum, post) => sum + post.comments_count, 0);
          setStats({
            totalPosts: data.length,
            totalLikes,
            totalComments,
            totalEngagement: totalLikes + totalComments,
          });
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [ready, authenticated, walletAddress, router]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    const client = supabaseClient;
    if (!client) return;

    try {
      const { error } = await client.from('posts').delete().eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== postId));
      setStats((prev) => ({
        ...prev,
        totalPosts: prev.totalPosts - 1,
      }));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
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
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Posts</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                Share updates with your supporters
              </p>
            </div>
            <Link
              href="/dashboard/posts/new"
              className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Create New Post
            </Link>
          </div>

          {/* Stats */}
          <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 md:grid-cols-4">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
              <h2 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">
                Total Posts
              </h2>
              <p className="text-2xl font-bold text-[#FFBF00] sm:text-3xl">{stats.totalPosts}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
              <h2 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">
                Total Likes
              </h2>
              <p className="text-2xl font-bold text-[#FFBF00] sm:text-3xl">{stats.totalLikes}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
              <h2 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">
                Total Comments
              </h2>
              <p className="text-2xl font-bold text-[#FFBF00] sm:text-3xl">{stats.totalComments}</p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
              <h2 className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">
                Total Engagement
              </h2>
              <p className="text-2xl font-bold text-[#FFBF00] sm:text-3xl">{stats.totalEngagement}</p>
            </div>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-2 text-xl font-semibold text-foreground">No posts yet</h2>
              <p className="mb-6 text-zinc-600 dark:text-zinc-400">
                Share your progress with supporters
              </p>
              <Link
                href="/dashboard/posts/new"
                className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  showActions={true}
                  onDelete={handleDelete}
                  builderAddress={walletAddress}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
