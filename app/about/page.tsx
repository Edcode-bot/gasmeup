import { LandingNavbar } from '@/components/landing-navbar';
import Link from 'next/link';
import { Users, Target, Zap, Shield } from 'lucide-react';
import { GetStartedButton } from '@/components/get-started-button';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">About GasMeUp</h1>
          
          {/* Mission */}
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">Our Mission</h2>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              GasMeUp is a direct, transparent, and gasless support platform for Web3 builders. 
              We believe creators should receive maximum value from their supporters, with minimal 
              friction and maximum transparency. Our mission is to empower builders to focus on 
              what they do best—building—while we handle the infrastructure for receiving support.
            </p>
          </section>

          {/* Why We Built This */}
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-foreground sm:text-3xl">Why We Built GasMeUp</h2>
            <p className="mb-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Traditional funding platforms take significant cuts, add complexity, and create barriers 
              between creators and their supporters. In the Web3 space, we saw an opportunity to build 
              something better—a platform that:
            </p>
            <ul className="space-y-3 text-lg text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-[#FFBF00]">•</span>
                <span>Eliminates unnecessary fees (we only take 3% to cover platform costs)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-[#FFBF00]">•</span>
                <span>Works across multiple blockchains for maximum accessibility</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-[#FFBF00]">•</span>
                <span>Keeps funds in the creator's wallet—no custodial accounts</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-[#FFBF00]">•</span>
                <span>Provides transparent, on-chain transaction records</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-[#FFBF00]">•</span>
                <span>Enables direct, peer-to-peer support without intermediaries</span>
              </li>
            </ul>
          </section>

          {/* Our Values */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">Our Values</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF00]/10">
                  <Shield className="h-6 w-6 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Transparency</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Every transaction is recorded on-chain. No hidden fees, no surprises.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF00]/10">
                  <Users className="h-6 w-6 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Creator-First</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Builders keep 97% of contributions. Your work, your value, your wallet.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF00]/10">
                  <Zap className="h-6 w-6 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Simplicity</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Connect wallet, send support. No complex forms or lengthy processes.
                </p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFBF00]/10">
                  <Target className="h-6 w-6 text-[#FFBF00]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Innovation</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Built for Web3, by Web3. Leveraging blockchain for better creator economics.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-lg border border-zinc-200 bg-[#FFBF00]/10 p-8 text-center dark:border-zinc-800">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">Ready to Get Started?</h2>
            <p className="mb-6 text-zinc-600 dark:text-zinc-400">
              Join builders and supporters building the future of Web3
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/explore"
                className="rounded-full bg-[#FFBF00] px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
              >
                Explore Builders
              </Link>
              <GetStartedButton className="min-h-[44px] rounded-full border border-zinc-300 bg-white px-6 py-3 font-semibold text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
