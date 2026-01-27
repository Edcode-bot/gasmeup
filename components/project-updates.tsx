'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import type { ProjectUpdate } from '@/lib/supabase';
import { MessageSquare, Plus, Calendar } from 'lucide-react';

interface ProjectUpdatesProps {
  projectId: string;
  builderAddress: string;
  isOwner?: boolean;
}

export function ProjectUpdates({ projectId, builderAddress, isOwner = false }: ProjectUpdatesProps) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchUpdates();
  }, [projectId]);

  const fetchUpdates = async () => {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
      .from('project_updates')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching updates:', error);
    } else {
      setUpdates(data || []);
    }
    setLoading(false);
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseClient || !newUpdate.title.trim() || !newUpdate.description.trim()) return;

    const { error } = await supabaseClient
      .from('project_updates')
      .insert({
        project_id: projectId,
        builder_address: builderAddress,
        title: newUpdate.title.trim(),
        description: newUpdate.description.trim(),
      });

    if (error) {
      console.error('Error adding update:', error);
    } else {
      setNewUpdate({ title: '', description: '' });
      setShowAddForm(false);
      fetchUpdates();
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading updates...</div>;
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Progress Updates
        </h2>
        {isOwner && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFBF00] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#FFD700]"
          >
            <Plus className="h-4 w-4" />
            Post Update
          </button>
        )}
      </div>

      {showAddForm && isOwner && (
        <form onSubmit={handleAddUpdate} className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Update Title
            </label>
            <input
              type="text"
              value={newUpdate.title}
              onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#FFBF00] focus:outline-none focus:ring-1 focus:ring-[#FFBF00] dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="e.g., Major feature completed, Bug fixes deployed"
              maxLength={200}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Update Description
            </label>
            <textarea
              value={newUpdate.description}
              onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#FFBF00] focus:outline-none focus:ring-1 focus:ring-[#FFBF00] dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="Share your progress, challenges, or what's coming next..."
              rows={4}
              maxLength={2000}
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#FFBF00] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#FFD700]"
            >
              Post Update
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {updates.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            No updates yet. {isOwner && 'Keep your supporters informed by posting regular updates!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div
              key={update.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-2">
                <h3 className="font-semibold text-foreground mb-2">{update.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                  {update.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(update.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
