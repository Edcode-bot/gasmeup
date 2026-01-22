'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { PostCard } from '@/components/posts/post-card';
import { supabaseClient } from '@/lib/supabase-client';
import Link from 'next/link';
import type { Post } from '@/lib/supabase';

const POSTS_PER_PAGE = 10;

export default function BuilderUpdatesPage() {
  const params = useParams();
  const [builderAddress, setBuilderAddress] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (params?.address) {
      setBuilderAddress(Array.isArray(params.address) ? params.address[0] : params.address);
    }
  }, [params]);

  useEffect(() => {
    if (!builderAddress || !supabaseClient) return;

    const fetchPosts = async () => {
      const client = supabaseClient;
      if (!client) return;

      setLoading(true);
      try {
        const { data, error } = await client
          .from('posts')
          .select('*')
          .eq('builder_address', builderAddress.toLowerCase())
          .order('created_at', { ascending: false })
          .range(0, page * POSTS_PER_PAGE - 1);

        if (error) throw error;

        if (data) {
          setPosts(data);
          setHasMore(data.length === page * POSTS_PER_PAGE);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [builderAddress, page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Updates</h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                  Latest updates from this builder
                </p>
              </div>
              <Link
                href={`/builder/${builderAddress}`}
                className="text-sm text-zinc-600 hover:text-[#FFBF00] dark:text-zinc-400 transition-colors"
              >
                ← Back to Profile
              </Link>
            </div>
          </div>

          {loading && posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400">Loading updates...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-2 text-xl font-semibold text-foreground">No updates yet</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                This builder hasn't shared any updates yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} showActions={false} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="min-h-[44px] rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
