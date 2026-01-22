import Link from 'next/link';
import { Twitter, Send, MessageCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-sm text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-sm text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                >
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Social</h3>
            <div className="flex gap-4">
              <a
                href="https://x.com/gas_meup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://t.me/gasmeupTG"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
              <a
                href="https://discord.gg/dm27G4nQn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 transition-colors hover:text-[#FFBF00] dark:text-zinc-400"
                aria-label="Discord"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            © {currentYear} GasMeUp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
