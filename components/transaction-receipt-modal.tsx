'use client';

import { useState, useEffect } from 'react';
import { getExplorerUrl, getTransactionStatus, getTokenSymbol, type SupportedChainId } from '@/lib/blockchain';
import { formatEther } from 'viem';
import { formatAddress } from '@/lib/utils';

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: string;
  chainId: SupportedChainId;
  fromAddress: string;
  toAddress: string;
  amount: number;
  message?: string | null;
}

export function TransactionReceiptModal({
  isOpen,
  onClose,
  txHash,
  chainId,
  fromAddress,
  toAddress,
  amount,
  message,
}: TransactionReceiptModalProps) {
  const [txStatus, setTxStatus] = useState<{
    status: 'pending' | 'confirmed' | 'failed';
    blockNumber?: bigint;
    confirmations?: number;
    actualAmount?: bigint;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && txHash) {
      const checkStatus = async () => {
        setLoading(true);
        try {
          const status = await getTransactionStatus(chainId, txHash);
          setTxStatus(status);
        } catch (error) {
          console.error('Error checking transaction status:', error);
        } finally {
          setLoading(false);
        }
      };
      checkStatus();
    }
  }, [isOpen, txHash, chainId]);

  if (!isOpen) return null;

  const tokenSymbol = getTokenSymbol(chainId);
  const explorerUrl = getExplorerUrl(chainId, txHash);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-foreground">Transaction Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Transaction Hash */}
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Transaction Hash</label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
                  {txHash}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(txHash)}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Status</label>
              <div className="mt-1">
                {loading ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm dark:bg-zinc-800">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent"></div>
                    Checking...
                  </div>
                ) : txStatus ? (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      statusColors[txStatus.status]
                    }`}
                  >
                    {txStatus.status.charAt(0).toUpperCase() + txStatus.status.slice(1)}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Unknown
                  </span>
                )}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">From</label>
                <p className="mt-1 font-mono text-sm text-foreground">{formatAddress(fromAddress)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">To</label>
                <p className="mt-1 font-mono text-sm text-foreground">{formatAddress(toAddress)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Amount</label>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {amount.toFixed(4)} {tokenSymbol}
                </p>
                {txStatus?.actualAmount && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Actual: {formatEther(txStatus.actualAmount)} {tokenSymbol}
                  </p>
                )}
              </div>
              {txStatus?.blockNumber && (
                <div>
                  <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Block Number</label>
                  <p className="mt-1 text-sm text-foreground">{txStatus.blockNumber.toString()}</p>
                </div>
              )}
              {txStatus?.confirmations !== undefined && (
                <div>
                  <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Confirmations</label>
                  <p className="mt-1 text-sm text-foreground">{txStatus.confirmations}</p>
                </div>
              )}
            </div>

            {/* Message */}
            {message && (
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Message</label>
                <p className="mt-1 text-sm text-foreground">{message}</p>
              </div>
            )}

            {/* Error */}
            {txStatus?.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-400">Error</p>
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{txStatus.error}</p>
              </div>
            )}

            {/* Explorer Link */}
            <div className="pt-4">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#FFBF00] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 sm:w-auto"
              >
                Open in Explorer
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
