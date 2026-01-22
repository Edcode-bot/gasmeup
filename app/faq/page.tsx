import { LandingNavbar } from '@/components/landing-navbar';
import { Footer } from '@/components/footer';
import { FAQAccordion } from '@/components/faq-accordion';

export default function FAQPage() {
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
        'We support 6 major blockchains: Ethereum, Polygon, Base, Arbitrum, Celo, and Optimism. You can receive support on any of these chains, and supporters can choose their preferred chain when sending contributions.',
    },
    {
      question: 'What are the fees?',
      answer:
        'GasMeUp charges a transparent 3% platform fee on all contributions. The remaining 97% goes directly to the builder. Additionally, supporters pay network gas fees required by the blockchain, which vary by chain and network conditions.',
    },
    {
      question: 'Is my wallet secure?',
      answer:
        'Yes! GasMeUp is non-custodial, meaning we never hold your funds. All transactions are executed directly on the blockchain to your wallet address. You maintain full control of your private keys and funds at all times.',
    },
    {
      question: 'How do I create a project?',
      answer:
        'After connecting your wallet and creating a profile, go to your dashboard and click "Add New Project". Fill in your project details including title, description, image, and optional funding goal. Once published, supporters can fund your specific project.',
    },
    {
      question: 'Can I update my profile?',
      answer:
        'Yes! You can update your profile information including username, bio, avatar, and social links at any time from your dashboard. Changes are reflected immediately on your public profile.',
    },
    {
      question: 'What happens if a transaction fails?',
      answer:
        'If a blockchain transaction fails, no funds are transferred and no platform fee is charged. The supporter can try again. Failed transactions are recorded in our system for transparency.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            Find answers to common questions about GasMeUp
          </p>
          
          <FAQAccordion items={faqItems} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
