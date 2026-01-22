'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import type { Post, Project, PostComment } from '@/lib/supabase';
import { formatAddress } from '@/lib/utils';
import { FileText, Package, MessageSquare, Trash2 } from 'lucide-react';
import Link from 'next/link';

type Tab = 'posts' | 'projects' | 'comments';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const fetchContent = async () => {
    const client = supabaseClient;
    if (!client) return;

    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const { data, error } = await client
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;
        setPosts(data || []);
      } else if (activeTab === 'projects') {
        const { data, error } = await client
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;
        setProjects(data || []);
      } else if (activeTab === 'comments') {
        const { data, error } = await client
          .from('post_comments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;
        setComments(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: 'post' | 'project' | 'comment', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    const client = supabaseClient;
    if (!client) return;

    try {
      if (type === 'post') {
        await client.from('posts').delete().eq('id', id);
      } else if (type === 'project') {
        await client.from('projects').delete().eq('id', id);
      } else if (type === 'comment') {
        await client.from('post_comments').delete().eq('id', id);
      }
      fetchContent();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Content Moderation</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Review and moderate posts, projects, and comments
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('posts')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'border-[#FFBF00] text-[#FFBF00]'
                  : 'border-transparent text-zinc-600 hover:text-foreground dark:text-zinc-400'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'border-[#FFBF00] text-[#FFBF00]'
                  : 'border-transparent text-zinc-600 hover:text-foreground dark:text-zinc-400'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                activeTab === 'comments'
                  ? 'border-[#FFBF00] text-[#FFBF00]'
                  : 'border-transparent text-zinc-600 hover:text-foreground dark:text-zinc-400'
              }`}
            >
              Comments
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">Loading content...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'posts' && (
              <>
                {posts.length === 0 ? (
                  <p className="text-center text-zinc-600 dark:text-zinc-400">No posts found</p>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{post.title}</h3>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {post.content}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                            by {formatAddress(post.builder_address)} •{' '}
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/builder/${post.builder_address}/posts/${post.id}`}
                            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete('post', post.id)}
                            className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'projects' && (
              <>
                {projects.length === 0 ? (
                  <p className="text-center text-zinc-600 dark:text-zinc-400">No projects found</p>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{project.title}</h3>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {project.description}
                          </p>
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                            by {formatAddress(project.builder_address)} • Status: {project.status} •{' '}
                            {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete('project', project.id)}
                            className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'comments' && (
              <>
                {comments.length === 0 ? (
                  <p className="text-center text-zinc-600 dark:text-zinc-400">No comments found</p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{comment.content}</p>
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                            by {formatAddress(comment.user_address)} •{' '}
                            {new Date(comment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete('comment', comment.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
