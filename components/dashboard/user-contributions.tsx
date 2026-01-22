'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { supabaseClient } from '@/lib/supabase-client';
import { formatAddress, formatAmountWithToken } from '@/lib/utils';
import { getExplorerUrl, type SupportedChainId } from '@/lib/blockchain';
import { TransactionReceiptModal } from '@/components/transaction-receipt-modal';
import Link from 'next/link';
import type { Support } from '@/lib/supabase';

export function UserContributions() {
  const { authenticated, user } = usePrivy();
  const [contributions, setContributions] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalContributed, setTotalContributed] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Support | null>(null);

  useEffect(() => {
    if (!authenticated || !user?.wallet?.address || !supabaseClient) {
      setLoading(false);
      return;
    }

    const fetchContributions = async () => {
      const client = supabaseClient;
      const walletAddr = user.wallet?.address;
      if (!client || !walletAddr) return;

      try {
        const { data, error } = await client
          .from('supports')
          .select('*')
          .eq('from_address', walletAddr.toLowerCase())
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching contributions:', error);
          return;
        }

        if (data) {
          setContributions(data as any);
          const total = data.reduce((sum, support) => sum + Number(support.amount), 0);
          setTotalContributed(total);
        }
      } catch (err) {
        console.error('Failed to fetch contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [authenticated, user?.wallet?.address]);

  if (!authenticated) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-2 text-xl font-semibold text-foreground">My Contributions</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Connect your wallet to see your contributions to builders.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-2 text-xl font-semibold text-foreground">My Contributions</h2>
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground sm:text-xl">My Contributions</h2>
        {totalContributed > 0 && (
          <span className="text-sm font-medium text-[#FFBF00]">
            Total: {totalContributed.toFixed(4)} (multi-chain)
          </span>
        )}
      </div>
      {contributions.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          You haven't made any contributions yet. Start supporting builders!
        </p>
      ) : (
        <div className="space-y-3">
          {contributions.map((contribution) => (
            <Link
              key={contribution.id}
              href={`/builder/${contribution.to_address}`}
              className="block rounded-lg border border-zinc-100 p-4 transition-colors hover:border-[#FFBF00] hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground break-words">
                    {formatAddress(contribution.to_address)}
                  </p>
                  {contribution.message && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                      {contribution.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    {new Date(contribution.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-semibold text-[#FFBF00]">
                      {formatAmountWithToken(Number(contribution.amount), contribution.chain_id)}
                    </p>
                    {contribution.via_contract && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5 font-medium dark:bg-green-900/20 dark:text-green-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Contract
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTx(contribution);
                    }}
                    className="text-xs text-zinc-500 hover:text-[#FFBF00] dark:text-zinc-400 sm:mt-1"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <TransactionReceiptModal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          txHash={selectedTx.tx_hash}
          chainId={selectedTx.chain_id as SupportedChainId}
          fromAddress={selectedTx.from_address}
          toAddress={selectedTx.to_address}
          amount={Number(selectedTx.amount)}
          message={selectedTx.message}
        />
      )}
    </div>
  );
}

