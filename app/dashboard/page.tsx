import { DashboardNavbar } from '@/components/dashboard-navbar';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BuilderCard } from '@/components/builder-card';
import { UserContributions } from '@/components/dashboard/user-contributions';
import { UserProfileCard } from '@/components/dashboard/user-profile-card';
import { ProfileCompletionIndicator } from '@/components/profile-completion-indicator';
import { QuickActions } from '@/components/quick-actions';
import { getGlobalChainStats } from '@/lib/chain-stats';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default async function Dashboard() {
  // Fetch active builders (profiles with at least one support)
  const { data: activeBuilders } = await supabase
    .from('profiles')
    .select('*, supports!inner(count)')
    .order('created_at', { ascending: false })
    .limit(6);

  // Get unique builder addresses from supports to find active builders
  const { data: builderAddresses } = await supabase
    .from('supports')
    .select('to_address')
    .order('created_at', { ascending: false });

  const uniqueBuilderAddresses = [
    ...new Set(builderAddresses?.map((s) => s.to_address) || []),
  ].slice(0, 6);

  const { data: builders } = await supabase
    .from('profiles')
    .select('*')
    .in('wallet_address', uniqueBuilderAddresses)
    .limit(6);

  // Get total contributions count
  const { count: totalContributions } = await supabase
    .from('supports')
    .select('*', { count: 'exact', head: true });

  // Get total builders count
  const { count: totalBuilders } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get total projects count
  const { count: activeProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  // Get global chain statistics
  const chainStats = await getGlobalChainStats();

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Dashboard</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Manage your projects and track your funding progress
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link href="/dashboard/projects/new">
                <Button size="sm">
                  <ArrowUpRight className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
              <Link href="/dashboard/posts/new">
                <Button variant="secondary" size="sm">
                  New Post
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Raised</p>
                    <p className="text-2xl font-bold text-foreground">
                      ${chainStats?.total.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="rounded-full bg-[#FFBF00]/10 p-3">
                    <DollarSign className="h-5 w-5 text-[#FFBF00]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Supporters</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalContributions || 0}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Projects</p>
                    <p className="text-2xl font-bold text-foreground">
                      {activeProjects || 0}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Builders</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalBuilders || 0}
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Welcome Banner for New Users */}
          <Card className="border-[#FFBF00]/20 bg-[#FFBF00]/5 dark:border-[#FFBF00]/30 dark:bg-[#FFBF00]/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">Welcome to GasMeUp!</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    You can explore projects and support builders right away. Profile details can be added later when you're ready to receive funding.
                  </p>
                </div>
                <Link href="/projects">
                  <Button size="sm">Explore Projects</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <UserProfileCard />
              <UserContributions />
            </div>
            
            <div className="space-y-6">
              <ProfileCompletionIndicator />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

