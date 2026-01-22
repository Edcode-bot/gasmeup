'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { supabaseClient } from '@/lib/supabase-client';
import { notifyLike } from '@/lib/notifications';

interface LikeButtonProps {
  postId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
  builderAddress?: string;
  className?: string;
}

export function LikeButton({
  postId,
  initialLikesCount,
  initialIsLiked,
  builderAddress,
  className = '',
}: LikeButtonProps) {
  const { authenticated, user } = usePrivy();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  const userAddress = user?.wallet?.address?.toLowerCase();

  const handleLike = async () => {
    if (!authenticated || !userAddress || !supabaseClient) {
      return;
    }

    setLoading(true);
    const client = supabaseClient;

    try {
      if (isLiked) {
        // Unlike
        const { error } = await client
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_address', userAddress);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await client.from('post_likes').insert({
          post_id: postId,
          user_address: userAddress,
        });

        if (error) {
          // If duplicate, just update state
          if (error.code !== '23505') throw error;
        }

        setIsLiked(true);
        setLikesCount((prev) => prev + 1);

        // Create notification for builder (only if liker is not the builder)
        if (builderAddress && builderAddress.toLowerCase() !== userAddress.toLowerCase()) {
          await notifyLike(builderAddress, userAddress, postId);
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!supabaseClient || !postId) return;

    const client = supabaseClient;
    const channel = client
      .channel(`post_likes:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          // Refetch likes count
          client
            .from('posts')
            .select('likes_count')
            .eq('id', postId)
            .single()
            .then(({ data }) => {
              if (data) {
                setLikesCount(data.likes_count);
              }
            });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [postId]);

  // Check if user has liked this post
  useEffect(() => {
    const client = supabaseClient;
    if (!authenticated || !userAddress || !client || !postId) {
      setIsLiked(false);
      return;
    }

    const checkLike = async () => {
      const { data } = await client
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_address', userAddress)
        .single();

      setIsLiked(!!data);
    };

    checkLike();
  }, [authenticated, userAddress, postId]);

  return (
    <button
      onClick={handleLike}
      disabled={!authenticated || loading}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        isLiked
          ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart size={18} className={isLiked ? 'fill-current' : ''} />
      <span>{likesCount}</span>
    </button>
  );
}
