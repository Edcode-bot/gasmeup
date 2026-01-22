'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { ConnectWallet } from '@/components/connect-wallet';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { ready, authenticated } = usePrivy();

  // Show simple navbar for logged out users
  if (!ready || !authenticated) {
    return (
      <nav className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl font-bold text-[#FFBF00]">GasMeUp</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Navigation Links - Desktop */}
            <div className="hidden items-center gap-6 sm:flex">
              <Link
                href="/"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Home
              </Link>
              <Link
                href="/explore"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Explore
              </Link>
              <Link
                href="/projects"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Projects
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Leaderboard
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                About
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Contact
              </Link>
            </div>
            
            {/* Desktop Connect Wallet */}
            <div className="hidden sm:block">
              <ConnectWallet />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 sm:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Home
              </Link>
              <Link
                href="/explore"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Explore
              </Link>
              <Link
                href="/projects"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Projects
              </Link>
              <Link
                href="/leaderboard"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Leaderboard
              </Link>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                About
              </Link>
              <Link
                href="/faq"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
              >
                Contact
              </Link>
              <ConnectWallet />
            </div>
          </div>
        )}
      </nav>
    );
  }

  // If authenticated, redirect to dashboard navbar is handled by DashboardNavbar component
  // This component is only for public pages
  return null;
}
