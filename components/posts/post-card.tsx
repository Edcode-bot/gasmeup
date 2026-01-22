'use client';

import Link from 'next/link';
import { formatAddress } from '@/lib/utils';
import { LikeButton } from './like-button';
import type { Post } from '@/lib/supabase';

interface PostCardProps {
  post: Post;
  showActions?: boolean;
  onDelete?: (postId: string) => void;
  builderAddress?: string;
}

export function PostCard({ post, showActions = false, onDelete, builderAddress }: PostCardProps) {
  const excerpt = post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <Link
          href={`/builder/${post.builder_address}/posts/${post.id}`}
          className="flex-1 min-w-0"
        >
          <h3 className="text-lg font-semibold text-foreground hover:text-[#FFBF00] transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
        {showActions && (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/posts/edit/${post.id}`}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {post.image_url && (
        <Link
          href={`/builder/${post.builder_address}/posts/${post.id}`}
          className="block mb-3 rounded-lg overflow-hidden"
        >
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        </Link>
      )}

      <Link
        href={`/builder/${post.builder_address}/posts/${post.id}`}
        className="block mb-3"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">{excerpt}</p>
      </Link>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialLikesCount={post.likes_count}
            initialIsLiked={false}
            builderAddress={builderAddress || post.builder_address}
          />
          <Link
            href={`/builder/${post.builder_address}/posts/${post.id}#comments`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-[#FFBF00] transition-colors"
          >
            {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
          </Link>
        </div>
        <time className="text-xs text-zinc-500 dark:text-zinc-500">
          {new Date(post.created_at).toLocaleDateString()}
        </time>
      </div>
    </div>
  );
}
