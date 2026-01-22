'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Navbar } from '@/components/navbar';
import { Avatar } from '@/components/avatar';
import { SocialLinks } from '@/components/social-links';
import { VerifiedBadge } from '@/components/verified-badge';
import Link from 'next/link';
import { formatAddress } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase-client';
import type { Profile } from '@/lib/supabase';
import { notifyContribution } from '@/lib/notifications';
import {
  parseEther,
  formatEther,
  type Address,
  createWalletClient,
  custom,
  type Chain,
} from 'viem';
import {
  getChainConfig,
  calculatePlatformFee,
  calculateAmountAfterFee,
  getExplorerUrl,
  estimateGas,
  getGasPrice,
  sendSupport,
  calculateContractFee,
  getChainById,
  type SupportedChainId,
} from '@/lib/blockchain';
import { getContractAddress } from '@/lib/contracts/config';
import { Shield, ExternalLink } from 'lucide-react';
import { celo } from 'viem/chains';

interface SupportPageProps {
  params: Promise<{ address: string }>;
}

const AMOUNT_PRESETS = [5, 10, 25, 50];
const SUPPORTED_CHAINS = [
  { 
    id: 42220, 
    name: 'Celo', 
    token: 'CELO', 
    explorer: 'celoscan.io',
    rpc: 'https://forno.celo.org'
  },
  { 
    id: 8453, 
    name: 'Base', 
    token: 'ETH', 
    explorer: 'basescan.org',
    rpc: 'https://mainnet.base.org'
  }
] as const;

type TransactionState = 'idle' | 'loading' | 'success' | 'error';

export default function SupportPage({ params }: SupportPageProps) {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [builderAddress, setBuilderAddress] = useState<string>('');
  const [builderProfile, setBuilderProfile] = useState<Profile | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainId>(42220);
  const [txState, setTxState] = useState<TransactionState>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [estimatedGas, setEstimatedGas] = useState<bigint | null>(null);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [contractFee, setContractFee] = useState<{fee: string, builderAmount: string} | null>(null);

  // Get params
  useEffect(() => {
    params.then((p) => setBuilderAddress(p.address));
  }, [params]);

  // Fetch builder profile
  useEffect(() => {
    if (!builderAddress) return;
    const client = supabaseClient;
    if (!client) return;

    const fetchProfile = async () => {
      try {
        const { data } = await client
          .from('profiles')
          .select('*')
          .eq('wallet_address', builderAddress.toLowerCase())
          .single();
        setBuilderProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [builderAddress]);

  // Calculate contract fee when amount or chain changes
  useEffect(() => {
    if (amount && selectedChainId) {
      calculateContractFee(amount, selectedChainId).then(setContractFee);
    } else {
      setContractFee(null);
    }
  }, [amount, selectedChainId]);

  // Estimate gas when amount or chain changes
  useEffect(() => {
    if (!authenticated || !amount || !user?.wallet?.address || !builderAddress) {
      setEstimatedGas(null);
      setGasPrice(null);
      return;
    }

    const walletAddress = user.wallet.address;
    if (!walletAddress) return;

    const estimate = async () => {
      try {
        const amountWei = parseEther(amount);
        const from = walletAddress as Address;
        const to = builderAddress as Address;

        const [gasEstimate, price] = await Promise.all([
          estimateGas(selectedChainId, from, to, amountWei),
          getGasPrice(selectedChainId),
        ]);

        setEstimatedGas(gasEstimate);
        setGasPrice(price);
      } catch (err) {
        console.error('Failed to estimate gas:', err);
      }
    };

    estimate();
  }, [amount, selectedChainId, authenticated, user?.wallet?.address, builderAddress]);

  const handlePresetClick = (preset: number) => {
    setAmount(preset.toString());
    setSelectedPreset(preset);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setSelectedPreset(null);
  };

  const handleSendSupport = async () => {
    if (!authenticated || !user?.wallet?.address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!builderAddress) {
      setError('Invalid builder address');
      return;
    }

    setTxState('loading');
    setError('');

    try {
      const wallet = wallets.find((w) => w.address.toLowerCase() === user.wallet?.address?.toLowerCase());
      if (!wallet) {
        throw new Error('Wallet not found. Please ensure your wallet is connected.');
      }

      // Get chain configuration
      const chainConfig = getChainConfig(selectedChainId);
      const chain = getChainById(selectedChainId);

      // Get Ethereum provider from Privy wallet
      const ethereumProvider = await wallet.getEthereumProvider();
      if (!ethereumProvider) {
        throw new Error('Failed to get wallet provider');
      }

      // Switch to the selected chain if needed
      try {
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${selectedChainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        // If chain doesn't exist, try to add it
        if (switchError.code === 4902) {
          await ethereumProvider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${selectedChainId.toString(16)}`,
                chainName: chainConfig.name,
                nativeCurrency: {
                  name: chainConfig.currency,
                  symbol: chainConfig.currency,
                  decimals: 18,
                },
                rpcUrls: [chain.rpcUrls.default.http[0]],
                blockExplorerUrls: [chainConfig.explorer],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }

      // Create wallet client using Privy's EIP1193 provider
      const walletClient = createWalletClient({
        chain,
        transport: custom(ethereumProvider),
        account: user.wallet.address as Address,
      });

      // Send support via smart contract
      const hash = await sendSupport(
        walletClient,
        builderAddress,
        amount,
        message,
        selectedChainId
      );
      
      // Calculate amounts for database
      const amountWei = parseEther(amount);
      const platformFee = calculatePlatformFee(amountWei);
      const amountAfterFee = calculateAmountAfterFee(amountWei);

      setTxHash(hash);
      setTxState('success');

      // Save to Supabase
      if (supabaseClient) {
        const { error: dbError } = await supabaseClient.from('supports').insert({
          from_address: user.wallet.address.toLowerCase(),
          to_address: builderAddress.toLowerCase(),
          amount: formatEther(amountAfterFee),
          message: message || null,
          tx_hash: hash,
          chain_id: selectedChainId,
          status: 'pending',
          via_contract: true,
        });

        if (dbError) {
          console.error('Failed to save to database:', dbError);
          // Don't fail the whole flow if DB save fails
        } else {
          // Create notification for builder
          await notifyContribution(
            builderAddress.toLowerCase(),
            user.wallet.address.toLowerCase(),
            Number(formatEther(amountAfterFee)),
            undefined, // projectId
            selectedChainId,
            hash
          );
        }
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/builder/${builderAddress}`);
      }, 3000);
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err?.message || 'Transaction failed. Please try again.');
      setTxState('error');
    }
  };

  const chainConfig = getChainConfig(selectedChainId);
  const amountWei = amount ? parseEther(amount) : BigInt(0);
  const platformFee = calculatePlatformFee(amountWei);
  const amountAfterFee = calculateAmountAfterFee(amountWei);
  const estimatedFee = estimatedGas && gasPrice ? estimatedGas * gasPrice : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Builder Info */}
          <div className="mb-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:mb-8 sm:p-6">
            <div className="flex items-start gap-4 mb-4">
              <Avatar
                src={builderProfile?.avatar_url}
                alt={builderProfile?.username || 'Avatar'}
                fallback={builderProfile?.username?.charAt(0).toUpperCase() || '?'}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    {builderProfile?.username || formatAddress(builderAddress)}
                  </h1>
                  {builderProfile?.verified && <VerifiedBadge size="md" />}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-2">
                  {formatAddress(builderAddress)}
                </p>
                {builderProfile?.bio && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3">
                    {builderProfile.bio}
                  </p>
                )}
                <SocialLinks
                  twitterUrl={builderProfile?.twitter_url}
                  githubUrl={builderProfile?.github_url}
                  linkedinUrl={builderProfile?.linkedin_url}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Success State */}
          {txState === 'success' && txHash && (
            <div className="mb-6 rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-900/20 sm:p-6">
              <h2 className="mb-2 text-lg font-semibold text-green-700 dark:text-green-400 sm:text-xl">
                Transaction Successful!
              </h2>
              <p className="mb-4 text-green-600 dark:text-green-300">
                Your support has been sent successfully.
              </p>
              <a
                href={getExplorerUrl(selectedChainId, txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-green-700 underline dark:text-green-400"
              >
                View on {chainConfig.name} Explorer →
              </a>
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Redirecting to builder profile...
              </p>
            </div>
          )}

          {/* Error State */}
          {txState === 'error' && error && (
            <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-900/20 sm:p-6">
              <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400 sm:text-xl">
                Transaction Failed
              </h2>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Support Form */}
          {txState !== 'success' && (
            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Amount ({chainConfig.currency})
                </label>
                <div className="mb-3 flex gap-2">
                  {AMOUNT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedPreset === preset
                          ? 'bg-[#FFBF00] text-black'
                          : 'border border-zinc-300 bg-white text-foreground hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Chain Selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Network
                </label>
                <select
                  value={selectedChainId}
                  onChange={(e) => setSelectedChainId(Number(e.target.value) as SupportedChainId)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {SUPPORTED_CHAINS.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name} ({chain.token})
                    </option>
                  ))}
                </select>
              </div>

              {/* Contract Info Badge */}
              {selectedChainId && getContractAddress(selectedChainId) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">
                      Secured by Smart Contract
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                    Your contribution is processed through our verified smart contract on {SUPPORTED_CHAINS.find(c => c.id === selectedChainId)?.name}.
                    Funds go directly to the builder's wallet.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                      {getContractAddress(selectedChainId)?.slice(0, 10)}...
                    </code>
                    <a 
                      href={`https://${SUPPORTED_CHAINS.find(c => c.id === selectedChainId)?.explorer}/address/${getContractAddress(selectedChainId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 flex items-center gap-1"
                    >
                      View Contract <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message for the builder..."
                  rows={4}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-foreground placeholder:text-zinc-400 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                />
              </div>

              {/* Fee Breakdown */}
              {amount && parseFloat(amount) > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Fee Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    {contractFee ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">Builder receives:</span>
                          <span className="font-medium text-foreground">{contractFee.builderAmount} {SUPPORTED_CHAINS.find(c => c.id === selectedChainId)?.token}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 dark:text-zinc-400">Platform fee (3%):</span>
                          <span className="font-medium text-foreground">{contractFee.fee} {SUPPORTED_CHAINS.find(c => c.id === selectedChainId)?.token}</span>
                        </div>
                      </>
                    ) : (
                      <>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Amount</span>
                      <span className="font-medium text-foreground">
                        {formatEther(amountWei)} {chainConfig.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Platform Fee (3%)</span>
                      <span className="font-medium text-foreground">
                        {formatEther(platformFee)} {chainConfig.currency}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
                      <span className="font-semibold text-foreground">Builder Receives</span>
                      <span className="font-semibold text-[#FFBF00]">
                        {formatEther(amountAfterFee)} {chainConfig.currency}
                      </span>
                    </div>
                      </>
                    )}
                    {estimatedFee && (
                      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>Estimated Network Fee</span>
                        <span>~{formatEther(estimatedFee)} {chainConfig.currency}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendSupport}
                disabled={txState === 'loading' || !authenticated || !amount || parseFloat(amount) <= 0}
                className="min-h-[44px] w-full rounded-full bg-[#FFBF00] px-6 py-3 text-base font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:px-8 sm:py-4"
              >
                {txState === 'loading' ? 'Sending Transaction...' : 'Send Support'}
              </button>

              {!authenticated && (
                <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                  Please connect your wallet to send support
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

