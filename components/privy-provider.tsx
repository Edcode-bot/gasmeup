'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // During build or if app ID is not set, render children without Privy
  if (!appId) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['wallet', 'email', 'sms'],
        appearance: {
          theme: 'light',
          accentColor: '#FFBF00',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        supportedChains: [
          {
            id: 42220,
            name: 'Celo',
            network: 'celo',
            nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
            rpcUrls: {
              default: { http: ['https://forno.celo.org'] },
              public: { http: ['https://forno.celo.org'] }
            },
            blockExplorers: {
              default: { name: 'Celoscan', url: 'https://celoscan.io' }
            }
          },
          {
            id: 8453,
            name: 'Base',
            network: 'base',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: { http: ['https://mainnet.base.org'] },
              public: { http: ['https://mainnet.base.org'] }
            },
            blockExplorers: {
              default: { name: 'Basescan', url: 'https://basescan.org' }
            }
          }
        ]
      }}
    >
      {children}
    </PrivyProvider>
  );
}

