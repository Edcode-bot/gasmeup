import { supabase } from './supabase';
import type { Profile, Project } from './supabase';

export interface TopBuilder {
  rank: number;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  verified: boolean;
  total_raised: number;
  supporter_count: number;
}

export interface TopSupporter {
  rank: number;
  wallet_address: string;
  username: string | null;
  total_given: number;
  builders_supported: number;
  contributions_count: number;
}

export interface TopProject {
  rank: number;
  id: string;
  title: string;
  image_url: string;
  builder_address: string;
  builder_username: string | null;
  raised_amount: number;
  goal_amount: number | null;
}

/**
 * Get top builders by total raised
 */
export async function getTopBuilders(limit: number = 10): Promise<TopBuilder[]> {
  try {
    // Fetch all profiles with their total raised
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .limit(1000);

    if (!profiles) return [];

    // Calculate total raised and supporter count for each builder
    const buildersWithStats = await Promise.all(
      profiles.map(async (profile) => {
        const { data: supports } = await supabase
          .from('supports')
          .select('amount, from_address')
          .eq('to_address', profile.wallet_address)
          .is('project_id', null); // Only builder supports, not project supports

        const totalRaised = supports?.reduce((sum, s) => sum + Number(s.amount || 0), 0) || 0;
        const uniqueSupporters = new Set(supports?.map((s) => s.from_address) || []).size;

        return {
          wallet_address: profile.wallet_address,
          username: profile.username,
          avatar_url: profile.avatar_url,
          verified: profile.verified,
          total_raised: totalRaised,
          supporter_count: uniqueSupporters,
        };
      })
    );

    // Sort by total raised and take top N
    const topBuilders = buildersWithStats
      .filter((b) => b.total_raised > 0)
      .sort((a, b) => b.total_raised - a.total_raised)
      .slice(0, limit)
      .map((builder, index) => ({
        ...builder,
        rank: index + 1,
      }));

    return topBuilders;
  } catch (error) {
    console.error('Failed to get top builders:', error);
    return [];
  }
}

/**
 * Get top supporters by total given
 */
export async function getTopSupporters(limit: number = 10): Promise<TopSupporter[]> {
  try {
    const { data: supports } = await supabase
      .from('supports')
      .select('from_address, amount, to_address');

    if (!supports) return [];

    // Group by from_address
    const supporterMap = new Map<string, { total: number; builders: Set<string>; count: number }>();

    supports.forEach((support) => {
      const address = support.from_address.toLowerCase();
      const existing = supporterMap.get(address) || { total: 0, builders: new Set(), count: 0 };
      existing.total += Number(support.amount || 0);
      existing.builders.add(support.to_address.toLowerCase());
      existing.count += 1;
      supporterMap.set(address, existing);
    });

    // Convert to array and sort
    const supporters = Array.from(supporterMap.entries())
      .map(([address, stats]) => ({
        wallet_address: address,
        total_given: stats.total,
        builders_supported: stats.builders.size,
        contributions_count: stats.count,
      }))
      .sort((a, b) => b.total_given - a.total_given)
      .slice(0, limit);

    // Fetch usernames for supporters
    const addresses = supporters.map((s) => s.wallet_address);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('wallet_address, username')
      .in('wallet_address', addresses);

    const profileMap = new Map(profiles?.map((p) => [p.wallet_address.toLowerCase(), p.username]) || []);

    return supporters.map((supporter, index) => ({
      ...supporter,
      rank: index + 1,
      username: profileMap.get(supporter.wallet_address) || null,
    }));
  } catch (error) {
    console.error('Failed to get top supporters:', error);
    return [];
  }
}

/**
 * Get top projects by raised amount
 */
export async function getTopProjects(limit: number = 10): Promise<TopProject[]> {
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .order('raised_amount', { ascending: false })
      .limit(limit);

    if (!projects) return [];

    // Fetch builder usernames
    const builderAddresses = [...new Set(projects.map((p) => p.builder_address))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('wallet_address, username')
      .in('wallet_address', builderAddresses);

    const profileMap = new Map(profiles?.map((p) => [p.wallet_address.toLowerCase(), p.username]) || []);

    return projects.map((project, index) => ({
      rank: index + 1,
      id: project.id,
      title: project.title,
      image_url: project.image_url,
      builder_address: project.builder_address,
      builder_username: profileMap.get(project.builder_address.toLowerCase()) || null,
      raised_amount: Number(project.raised_amount),
      goal_amount: project.goal_amount ? Number(project.goal_amount) : null,
    }));
  } catch (error) {
    console.error('Failed to get top projects:', error);
    return [];
  }
}

/**
 * Get supporter badge tier based on total contributed (USD)
 */
export function getSupporterBadge(totalContributedUSD: number): { tier: string; emoji: string; name: string } {
  if (totalContributedUSD >= 1000) {
    return { tier: 'champion', emoji: '🏆', name: 'Champion' };
  } else if (totalContributedUSD >= 500) {
    return { tier: 'forest', emoji: '🌲', name: 'Forest' };
  } else if (totalContributedUSD >= 100) {
    return { tier: 'tree', emoji: '🌳', name: 'Tree' };
  } else if (totalContributedUSD >= 50) {
    return { tier: 'sprout', emoji: '🌿', name: 'Sprout' };
  } else if (totalContributedUSD >= 10) {
    return { tier: 'seedling', emoji: '🌱', name: 'Seedling' };
  }
  return { tier: 'none', emoji: '', name: '' };
}
