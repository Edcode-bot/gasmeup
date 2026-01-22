'use client';

import { usePrivy } from '@privy-io/react-auth';
import { formatAddress } from '@/lib/utils';

export function ConnectWallet() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) {
    return (
      <button
        disabled
        className="rounded-full bg-[#FFBF00] px-6 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Loading...
      </button>
    );
  }

  if (authenticated && user?.wallet?.address) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <span className="text-sm font-medium text-foreground text-center sm:text-left">
          {formatAddress(user.wallet.address)}
        </span>
        <button
          onClick={logout}
          className="min-h-[44px] rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="min-h-[44px] w-full rounded-full bg-[#FFBF00] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90 sm:w-auto"
    >
      Connect Wallet
    </button>
  );
}

