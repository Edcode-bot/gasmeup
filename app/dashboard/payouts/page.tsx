'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import Link from 'next/link';
import { formatAddress, formatAmountWithToken } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase-client';
import { getExplorerUrl, getTransactionStatus, type SupportedChainId } from '@/lib/blockchain';
import { TransactionReceiptModal } from '@/components/transaction-receipt-modal';
import type { Support } from '@/lib/supabase';

export default function PayoutsPage() {
  const { ready, authenticated, user } = usePrivy();
  const [supports, setSupports] = useState<Support[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReceived, setTotalReceived] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Support | null>(null);

  const walletAddress = user?.wallet?.address?.toLowerCase();

  useEffect(() => {
    if (!ready || !authenticated || !walletAddress || !supabaseClient) {
      if (ready && !authenticated) {
        setLoading(false);
      }
      return;
    }

    const fetchPayouts = async () => {
      const client = supabaseClient;
      if (!client) return;

      try {
        // Fetch all supports received by this builder
        const { data, error } = await client
          .from('supports')
          .select('*')
          .eq('to_address', walletAddress)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching supports:', error);
          return;
        }

        if (data) {
          setSupports(data);
          const total = data.reduce((sum, support) => sum + Number(support.amount), 0);
          setTotalReceived(total);
        }
      } catch (err) {
        console.error('Failed to fetch payouts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [ready, authenticated, walletAddress]);

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNavbar />

      <main className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">Payouts</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              View your received support transactions
            </p>
          </div>

          {/* Total Received */}
          <div className="mb-8 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
            <h2 className="mb-2 text-xl font-semibold text-foreground">Total Received</h2>
            <p className="text-4xl font-bold text-[#FFBF00]">{totalReceived.toFixed(4)} ETH</p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              All amounts are from database (mirrors blockchain transactions)
            </p>
          </div>

          {/* Transaction History */}
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground sm:text-xl">Transaction History</h2>
            {loading ? (
              <p className="text-zinc-600 dark:text-zinc-400">Loading transactions...</p>
            ) : supports.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">
                No transactions yet. Start receiving support from the community!
              </p>
            ) : (
              <div className="space-y-4">
                {supports.map((support) => (
                  <div
                    key={support.id}
                    className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground break-words">
                        From: {formatAddress(support.from_address)}
                      </p>
                      {support.message && (
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 break-words">
                          {support.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        {new Date(support.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-2">
                      <p className="text-lg font-bold text-[#FFBF00]">
                        {formatAmountWithToken(Number(support.amount), support.chain_id)}
                      </p>
                      <div className="flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-2">
                        {support.status && (
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              support.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : support.status === 'failed'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}
                          >
                            {support.status}
                          </span>
                        )}
                          {support.via_contract && (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs rounded-full px-2 py-0.5 font-medium dark:bg-green-900/20 dark:text-green-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Contract
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedTx(support)}
                          className="text-xs text-zinc-500 hover:text-[#FFBF00] dark:text-zinc-400"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

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

