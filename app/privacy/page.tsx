import { Navbar } from '@/components/navbar';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">Privacy Policy</h1>
          <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-500">
            Last updated: January 1, 2024
          </p>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">1. Introduction</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                GasMeUp ("we," "our," or "us") is committed to protecting your privacy. This Privacy 
                Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">2. Information We Collect</h2>
              <h3 className="mb-2 text-xl font-semibold text-foreground">2.1 Wallet Addresses</h3>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                We collect and store wallet addresses associated with your account. Wallet addresses 
                are public blockchain identifiers and are necessary for processing transactions.
              </p>

              <h3 className="mb-2 text-xl font-semibold text-foreground">2.2 Profile Information</h3>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                You may choose to provide optional profile information including:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Username</li>
                <li>Bio/description</li>
                <li>Avatar image URL</li>
                <li>Social media links (Twitter, GitHub, LinkedIn)</li>
              </ul>

              <h3 className="mb-2 text-xl font-semibold text-foreground">2.3 Transaction Data</h3>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                We record transaction data including amounts, timestamps, and blockchain transaction 
                hashes. This data is stored on-chain and in our database for platform functionality.
              </p>

              <h3 className="mb-2 text-xl font-semibold text-foreground">2.4 Usage Data</h3>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                We may collect information about how you interact with our platform, including pages 
                visited, features used, and time spent on the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                We use the information we collect to:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Provide and maintain our platform services</li>
                <li>Process transactions and facilitate payments</li>
                <li>Display your profile and project information</li>
                <li>Send notifications about your account activity</li>
                <li>Improve and optimize our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">4. Blockchain Transparency</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                Please note that blockchain transactions are public by nature. When you make a 
                transaction on GasMeUp:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Transaction details are permanently recorded on the public blockchain</li>
                <li>Wallet addresses and transaction amounts are publicly visible</li>
                <li>This information cannot be deleted or modified</li>
                <li>Anyone can view blockchain transaction history</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">5. Data Storage and Security</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                We use Supabase for secure database storage. While we implement security measures 
                to protect your data, no method of transmission over the internet is 100% secure. 
                We cannot guarantee absolute security of your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">6. Third-Party Services</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                We use third-party services that may collect information:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li><strong>Privy:</strong> For wallet authentication and connection</li>
                <li><strong>Supabase:</strong> For database and backend services</li>
                <li><strong>Vercel:</strong> For hosting and deployment</li>
              </ul>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                These services have their own privacy policies governing data collection and use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">7. Your Rights</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                You have the right to:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Access your personal information</li>
                <li>Update or correct your profile information</li>
                <li>Request deletion of your profile (note: blockchain transactions cannot be deleted)</li>
                <li>Opt out of certain communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">8. GDPR Compliance</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                If you are located in the European Economic Area (EEA), you have certain data 
                protection rights under GDPR. We will process your personal data in accordance 
                with GDPR requirements. You may contact us to exercise your rights under GDPR.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">9. Children's Privacy</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                GasMeUp is not intended for users under the age of 18. We do not knowingly collect 
                personal information from children. If you believe we have collected information 
                from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">10. Changes to This Policy</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the "Last 
                updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">11. Contact Us</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:support@gasmeup.com" className="text-[#FFBF00] hover:underline">
                  support@gasmeup.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
