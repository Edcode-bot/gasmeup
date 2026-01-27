'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import type { Milestone } from '@/lib/supabase';
import { Target, CheckCircle, Circle } from 'lucide-react';

interface MilestonesProps {
  projectId: string;
  isOwner?: boolean;
}

export function Milestones({ projectId, isOwner = false }: MilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    funding_target: '',
  });

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching milestones:', error);
    } else {
      setMilestones(data || []);
    }
    setLoading(false);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseClient || !newMilestone.title.trim()) return;

    const { error } = await supabaseClient
      .from('milestones')
      .insert({
        project_id: projectId,
        title: newMilestone.title.trim(),
        funding_target: newMilestone.funding_target ? parseFloat(newMilestone.funding_target) : null,
        status: 'open',
      });

    if (error) {
      console.error('Error adding milestone:', error);
    } else {
      setNewMilestone({ title: '', funding_target: '' });
      setShowAddForm(false);
      fetchMilestones();
    }
  };

  const toggleMilestoneStatus = async (milestoneId: string, currentStatus: string) => {
    if (!supabaseClient) return;

    const newStatus = currentStatus === 'open' ? 'completed' : 'open';
    
    const { error } = await supabaseClient
      .from('milestones')
      .update({ status: newStatus })
      .eq('id', milestoneId);

    if (error) {
      console.error('Error updating milestone:', error);
    } else {
      fetchMilestones();
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading milestones...</div>;
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Milestones</h2>
        {isOwner && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-lg bg-[#FFBF00] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#FFD700]"
          >
            Add Milestone
          </button>
        )}
      </div>

      {showAddForm && isOwner && (
        <form onSubmit={handleAddMilestone} className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Milestone Title
            </label>
            <input
              type="text"
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#FFBF00] focus:outline-none focus:ring-1 focus:ring-[#FFBF00] dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="e.g., Launch MVP, Add user authentication"
              maxLength={200}
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Funding Target (optional)
            </label>
            <input
              type="number"
              value={newMilestone.funding_target}
              onChange={(e) => setNewMilestone({ ...newMilestone, funding_target: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-[#FFBF00] focus:outline-none focus:ring-1 focus:ring-[#FFBF00] dark:border-zinc-700 dark:bg-zinc-900"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#FFBF00] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#FFD700]"
            >
              Add Milestone
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

      {milestones.length === 0 ? (
        <div className="text-center py-8">
          <Target className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">
            No milestones defined yet. {isOwner && 'Add your first milestone to track your progress!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`rounded-lg border p-4 ${
                milestone.status === 'completed'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => isOwner && toggleMilestoneStatus(milestone.id, milestone.status)}
                  className={`mt-1 flex-shrink-0 ${
                    isOwner ? 'cursor-pointer hover:opacity-70' : 'cursor-default'
                  }`}
                  disabled={!isOwner}
                >
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-zinc-400" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className={`font-medium text-foreground ${
                    milestone.status === 'completed' ? 'line-through opacity-60' : ''
                  }`}>
                    {milestone.title}
                  </h3>
                  {milestone.funding_target && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      Target: ${milestone.funding_target.toFixed(2)}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      milestone.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                    }`}>
                      {milestone.status}
                    </span>
                    {isOwner && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Click to {milestone.status === 'completed' ? 'reopen' : 'mark complete'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
