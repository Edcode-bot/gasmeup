import { Navbar } from '@/components/navbar';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">Terms of Service</h1>
          <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-500">
            Last updated: January 1, 2024
          </p>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                By accessing and using GasMeUp, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to these Terms of Service, please 
                do not use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">2. Use License</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                Permission is granted to temporarily use GasMeUp for personal, non-commercial 
                transitory viewing only. This is the grant of a license, not a transfer of title, 
                and under this license you may not:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on GasMeUp</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">3. Platform Fees</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                GasMeUp charges a 3% platform fee on all contributions. This fee is deducted 
                automatically from each transaction. The remaining 97% goes directly to the 
                builder's wallet. All fees are transparent and displayed before transaction 
                confirmation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">4. Blockchain Transactions</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                All transactions on GasMeUp are executed on public blockchains. Once a transaction 
                is confirmed on the blockchain, it cannot be reversed. You are solely responsible 
                for:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Verifying transaction details before confirmation</li>
                <li>Maintaining the security of your wallet and private keys</li>
                <li>Understanding the risks associated with blockchain transactions</li>
                <li>Paying any network fees (gas fees) required by the blockchain</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">5. User Conduct</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                You agree not to use GasMeUp to:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Engage in any illegal activities</li>
                <li>Impersonate any person or entity</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Interfere with or disrupt the platform's operation</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">6. Limitation of Liability</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                GasMeUp is provided "as is" without warranties of any kind. We shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages resulting 
                from your use of the platform, including but not limited to:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-zinc-600 dark:text-zinc-400">
                <li>Loss of funds due to user error or wallet compromise</li>
                <li>Blockchain network failures or congestion</li>
                <li>Smart contract vulnerabilities or exploits</li>
                <li>Third-party service interruptions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">7. Changes to Terms</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                We reserve the right to modify these Terms of Service at any time. Changes will 
                be effective immediately upon posting. Your continued use of GasMeUp after changes 
                are posted constitutes your acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-foreground">8. Contact Information</h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                If you have any questions about these Terms of Service, please contact us at{' '}
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
