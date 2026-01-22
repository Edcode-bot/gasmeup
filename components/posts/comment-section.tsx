'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Avatar } from '@/components/avatar';
import { formatAddress } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase-client';
import type { PostComment } from '@/lib/supabase';
import { notifyComment } from '@/lib/notifications';

interface CommentSectionProps {
  postId: string;
  builderAddress: string;
}

interface CommentWithProfile extends PostComment {
  profile?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export function CommentSection({ postId, builderAddress }: CommentSectionProps) {
  const { authenticated, user } = usePrivy();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const userAddress = user?.wallet?.address?.toLowerCase();

  useEffect(() => {
    const client = supabaseClient;
    if (!client) return;

    const fetchComments = async () => {
      setLoading(true);

      try {
        const { data, error } = await client
          .from('post_comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch profiles for commenters
        if (data && data.length > 0) {
          const addresses = [...new Set(data.map((c) => c.user_address))];
          const { data: profiles } = await client
            .from('profiles')
            .select('wallet_address, username, avatar_url')
            .in('wallet_address', addresses);

          const profileMap = new Map(
            profiles?.map((p) => [p.wallet_address.toLowerCase(), p]) || []
          );

          const commentsWithProfiles = data.map((comment) => ({
            ...comment,
            profile: profileMap.get(comment.user_address.toLowerCase()) || null,
          }));

          setComments(commentsWithProfiles);
        } else {
          setComments([]);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Subscribe to real-time updates
    const channel = client
      .channel(`post_comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated || !userAddress || !supabaseClient || !newComment.trim()) return;

    setSubmitting(true);
    const client = supabaseClient;
    if (!client) return;

    try {
      const { error } = await client.from('post_comments').insert({
        post_id: postId,
        user_address: userAddress,
        content: newComment.trim(),
      });

      if (error) throw error;

      // Create notification for builder (only if commenter is not the builder)
      if (builderAddress.toLowerCase() !== userAddress.toLowerCase()) {
        await notifyComment(builderAddress, userAddress, postId, newComment.trim());
      }

      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="comments" className="mt-8">
      <h3 className="mb-4 text-xl font-semibold text-foreground">
        Comments ({comments.length})
      </h3>

      {authenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            maxLength={1000}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {newComment.length}/1000 characters
            </span>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="min-h-[36px] rounded-full bg-[#FFBF00] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Please connect your wallet to add a comment.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-zinc-600 dark:text-zinc-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:gap-4"
            >
              <Avatar
                src={comment.profile?.avatar_url || null}
                alt={comment.profile?.username || 'Avatar'}
                fallback={comment.profile?.username?.charAt(0).toUpperCase() || '?'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {comment.profile?.username || formatAddress(comment.user_address)}
                  </span>
                  <time className="text-xs text-zinc-500 dark:text-zinc-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
