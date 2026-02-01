import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GetStartedButton } from '@/components/get-started-button';
import { FeaturedBuilders } from '@/components/featured-builders';
import { FAQAccordion } from '@/components/faq-accordion';
import { AnimatedCounter } from '@/components/animated-counter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Wallet, Search, Send, Shield, Zap, Eye, Link2, ArrowRight, Github, Users, DollarSign, Target } from 'lucide-react';

export default async function Home() {
  // Fetch featured builders (top 6 by total raised)
  const { data: allBuilders } = await supabase
    .from('profiles')
    .select('*')
    .limit(100);

  // Calculate total received for each builder
  const buildersWithTotals = await Promise.all(
    (allBuilders || []).map(async (builder) => {
      const { data: supports } = await supabase
        .from('supports')
        .select('amount')
        .eq('to_address', builder.wallet_address)
        .is('project_id', null); // Only builder supports, not project supports

      const totalReceived =
        supports?.reduce((sum, support) => sum + Number(support.amount), 0) || 0;

      return {
        ...builder,
        total_received: totalReceived,
      };
    })
  );

  // Sort by total received and take top 6
  const featuredBuilders = buildersWithTotals
    .sort((a, b) => b.total_received - a.total_received)
    .slice(0, 6);

  // Get stats
  const { count: totalBuilders } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalSupports } = await supabase
    .from('supports')
    .select('*', { count: 'exact', head: true });

  // Calculate total amount raised in USD equivalent across all supported chains.
  // NOTE: This uses approximate on-chain amounts multiplied by live token prices.
  const { data: allSupports } = await supabase
    .from('supports')
    .select('amount, chain_id');

  let totalUsdRaised = 0;

  if (allSupports && allSupports.length > 0) {
    // Map chain IDs to CoinGecko token IDs
    const chainTokenMap: Record<number, string> = {
      8453: 'base', // Base
      42220: 'celo', // Celo
    };

    const uniqueTokenIds = Array.from(
      new Set(
        allSupports
          .map((s) => chainTokenMap[s.chain_id as number])
          .filter((id): id is string => Boolean(id))
      )
    );

    let prices: Record<string, { usd: number }> = {};

    if (uniqueTokenIds.length > 0) {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueTokenIds.join(
            ','
          )}&vs_currencies=usd`,
          { next: { revalidate: 300 } } // cache for 5 minutes
        );
        if (res.ok) {
          prices = (await res.json()) as Record<string, { usd: number }>;
        }
      } catch (e) {
        console.error('Failed to fetch token prices for stats:', e);
      }
    }

    totalUsdRaised = allSupports.reduce((sum, support) => {
      const tokenId = chainTokenMap[support.chain_id as number];
      const price = tokenId ? prices[tokenId]?.usd || 0 : 0;
      const amount = Number(support.amount || 0);
      return sum + amount * price;
    }, 0);
  }

  // Get active projects count
  const { count: activeProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // FAQ items
  const faqItems = [
    {
      question: 'What is GasMeUp?',
      answer:
        'GasMeUp is a Web3 platform that enables direct, transparent support for builders and creators. Supporters can fund builders and projects across multiple blockchains with minimal fees and maximum transparency.',
    },
    {
      question: 'How do I receive funds?',
      answer:
        'Simply connect your wallet, create a profile, and share your profile link. Supporters can send funds directly to your wallet address. All transactions are processed on-chain and funds go straight to your wallet—no custodial accounts.',
    },
    {
      question: 'What chains are supported?',
      answer:
        'We support 2 major blockchains: Base and Celo. You can receive support on both chains, and supporters can choose their preferred chain when sending contributions.',
    },
    {
      question: 'What are the fees?',
      answer:
        'GasMeUp charges a transparent 3% platform fee on all contributions. The remaining 97% goes directly to the builder. Additionally, supporters pay network gas fees required by the blockchain, which vary by chain and network conditions.',
    },
    {
      question: 'What about incentives?',
      answer:
        'GasMeUp is early. Today, support is about transparency, progress, and recognition. Incentives may be added later as the platform grows. We focus on helping builders get funded and supporters make informed decisions.',
    },
    {
      question: 'Is my wallet secure?',
      answer:
        'Yes! GasMeUp is non-custodial, meaning we never hold your funds. All transactions are executed directly on the blockchain to your wallet address. You maintain full control of your private keys and funds at all times.',
    },
  ];

  // Testimonials (mock data for now)
  const testimonials = [
    {
      quote:
        'GasMeUp has transformed how I receive support from my community. The low fees and direct payments make it perfect for independent builders.',
      author: 'Alex Chen',
      role: 'Web3 Developer',
    },
    {
      quote:
        'As a supporter, I love the transparency. I can see exactly where my contributions go, and the multi-chain support makes it so convenient.',
      author: 'Sarah Johnson',
      role: 'Crypto Enthusiast',
    },
    {
      quote:
        'The project funding feature is game-changing. I can showcase my work and get funded for specific projects, not just general support.',
      author: 'Marcus Rivera',
      role: 'Blockchain Builder',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-[#FFBF00]/5 dark:from-zinc-900 dark:via-zinc-950 dark:to-[#FFBF00]/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,191,0,0.1),transparent_50%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
            <div className="text-center">
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Fund the{' '}
                <span className="bg-gradient-to-r from-[#FFBF00] via-[#FFD700] to-[#FFBF00] bg-clip-text text-transparent animate-gradient">
                  Builders
                </span>
                .<br />
                Support the{' '}
                <span className="bg-gradient-to-r from-[#FFBF00] via-[#FFD700] to-[#FFBF00] bg-clip-text text-transparent">
                  Future
                </span>
                .
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl">
                Direct, transparent, gasless support for creators on Web3. Join{' '}
                <AnimatedCounter value={totalBuilders || 0} /> builders already funded.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <GetStartedButton />
                <Link href="/explore">
                  <Button variant="secondary" size="lg">
                    Explore Builders
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                Get started in three simple steps
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFBF00]/10">
                  <Wallet className="h-8 w-8 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">1. Connect Your Wallet</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Link your Web3 wallet using Privy. No email, no password—just your wallet.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFBF00]/10">
                  <Search className="h-8 w-8 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">2. Find Builders & Projects</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Browse creators and their projects. Discover amazing work being built on Web3.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFBF00]/10">
                  <Send className="h-8 w-8 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">3. Send Support Directly</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Choose your amount and chain, then send support directly to the builder's wallet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-zinc-50 py-16 dark:bg-zinc-900 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Why GasMeUp?</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF00]/10">
                  <Shield className="h-6 w-6 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Non-Custodial</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Your funds, your control. We never hold your money—it goes straight to your wallet.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF00]/10">
                  <Link2 className="h-6 w-6 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Multi-Chain</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Support on 6+ blockchains. Choose the chain that works best for you.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF00]/10">
                  <Eye className="h-6 w-6 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Transparent</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Every transaction on-chain. Full transparency, no hidden fees.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF00]/10">
                  <Zap className="h-6 w-6 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Zero Fees</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  97% goes to builders. Only 3% platform fee to keep the lights on.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Platform Stats</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <p className="mb-2 text-5xl font-bold text-[#FFBF00] sm:text-6xl">
                  <AnimatedCounter value={totalBuilders || 0} />
                </p>
                <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Total Builders</p>
              </div>
              <div className="text-center">
                <p className="mb-2 text-5xl font-bold text-[#FFBF00] sm:text-6xl">
                  <AnimatedCounter value={totalSupports || 0} />
                </p>
                <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Total Contributions</p>
              </div>
              <div className="text-center">
                <p className="mb-2 text-5xl font-bold text-[#FFBF00] sm:text-6xl">
                  ${totalUsdRaised.toFixed(2)}
                </p>
                <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                  Total Raised (USD)
          </p>
        </div>
              <div className="text-center">
                <p className="mb-2 text-5xl font-bold text-[#FFBF00] sm:text-6xl">
                  <AnimatedCounter value={activeProjects || 0} />
                </p>
                <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Active Projects</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Builders */}
        <FeaturedBuilders builders={featuredBuilders} />

        {/* Roadmap */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Roadmap</h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                How GasMeUp evolves to better support builders and projects
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFBF00]/20">
                  <span className="text-lg font-bold text-[#FFBF00]">1</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Direct Funding</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Fund builders and projects directly. Simple, transparent support for creators building on Base and Celo.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFBF00]/20">
                  <span className="text-lg font-bold text-[#FFBF00]">2</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Milestone-Based Funding</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Funding tied to specific milestones and requirements. Clear goals and transparent progress tracking.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFBF00]/20">
                  <span className="text-lg font-bold text-[#FFBF00]">3</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Discovery & Reputation</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Enhanced discovery, reputation signals, and prioritization. Help supporters find the most promising projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">What People Say</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="mb-4 text-zinc-600 dark:text-zinc-400">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-zinc-50 py-16 dark:bg-zinc-900 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <FAQAccordion items={faqItems} />
        </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
