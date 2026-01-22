'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LandingNavbar } from '@/components/landing-navbar';
import { LikeButton } from '@/components/posts/like-button';
import { CommentSection } from '@/components/posts/comment-section';
import { CopyLinkButton } from '@/components/copy-link-button';
import { DateDisplay } from '@/components/date-display';
import { formatAddress } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase-client';
import Link from 'next/link';
import type { Post } from '@/lib/supabase';

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const [postId, setPostId] = useState<string>('');
  const [builderAddress, setBuilderAddress] = useState<string>('');
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.postId && params?.address) {
      setPostId(Array.isArray(params.postId) ? params.postId[0] : params.postId);
      setBuilderAddress(Array.isArray(params.address) ? params.address[0] : params.address);
    }
  }, [params]);

  useEffect(() => {
    if (!postId || !supabaseClient) return;

    const fetchPost = async () => {
      const client = supabaseClient;
      if (!client) return;

      try {
        const { data, error } = await client
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) throw error;

        if (data) {
          setPost(data);
          setBuilderAddress(data.builder_address);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  // Use a consistent URL format - will be set properly on client
  const [postUrl, setPostUrl] = useState<string>('');

  useEffect(() => {
    if (builderAddress && postId) {
      const url = `${window.location.origin}/builder/${builderAddress}/posts/${postId}`;
      setPostUrl(url);
    }
  }, [builderAddress, postId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <LandingNavbar />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-zinc-600 dark:text-zinc-400">Loading post...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col">
        <LandingNavbar />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-2xl font-bold text-foreground">Post not found</h1>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              The post you are looking for does not exist.
            </p>
            <Link
              href={`/builder/${builderAddress}`}
              className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              Back to Profile
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href={`/builder/${builderAddress}`}
              className="text-sm text-zinc-600 hover:text-[#FFBF00] dark:text-zinc-400 transition-colors"
            >
              ← Back to Profile
            </Link>
            {postUrl && <CopyLinkButton url={postUrl} />}
          </div>

          <article className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">{post.title}</h1>

            <div className="mb-6 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
              <DateDisplay date={post.created_at} format="short" />
              {post.updated_at !== post.created_at && (
                <span>(Updated <DateDisplay date={post.updated_at} format="short" />)</span>
              )}
            </div>

            {post.image_url && (
              <div className="mb-6 overflow-hidden rounded-lg">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
              {post.content.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <LikeButton
                postId={post.id}
                initialLikesCount={post.likes_count}
                initialIsLiked={false}
                builderAddress={builderAddress}
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </article>

          <CommentSection postId={post.id} builderAddress={builderAddress} />
        </div>
      </main>
    </div>
  );
}
