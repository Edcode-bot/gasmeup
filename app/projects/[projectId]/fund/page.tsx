'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { DashboardNavbar } from '@/components/dashboard-navbar';
import Link from 'next/link';
import { createWalletClient, custom, parseEther, formatEther } from 'viem';
import { base, celo } from 'viem/chains';
import type { Address } from 'viem';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Avatar } from '@/components/avatar';
import { supabaseClient } from '@/lib/supabase-client';
import { formatAddress } from '@/lib/user-utils';
import type { Project, Profile } from '@/lib/supabase';
import { getChainConfig, calculatePlatformFee, calculateAmountAfterFee, getExplorerUrl, estimateGas, getGasPrice, type SupportedChainId } from '@/lib/blockchain';
import { notifyProjectFunding } from '@/lib/notifications';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AMOUNT_PRESETS = [5, 10, 25, 50];
const SUPPORTED_CHAINS = [
  { id: 8453, name: 'Base', currency: 'ETH' },
  { id: 42220, name: 'Celo', currency: 'CELO' },
] as const;

type TransactionState = 'idle' | 'loading' | 'success' | 'error';

export default function ProjectFundPage() {
  const router = useRouter();
  const params = useParams();
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [projectId, setProjectId] = useState<string>('');
  const [project, setProject] = useState<(Project & { builder?: Profile | null }) | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [selectedChainId, setSelectedChainId] = useState<SupportedChainId>(8453); // Base as default
  const [txState, setTxState] = useState<TransactionState>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [estimatedGas, setEstimatedGas] = useState<bigint | null>(null);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);

  // Get params
  useEffect(() => {
    if (params?.projectId) {
      setProjectId(Array.isArray(params.projectId) ? params.projectId[0] : params.projectId);
    }
  }, [params]);

  // Fetch project
  useEffect(() => {
    if (!projectId) return;
    const client = supabaseClient;
    if (!client) return;

    const fetchProject = async () => {
      try {
        const { data: projectData, error: projectError } = await client
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        if (!projectData) return;

        // Fetch builder profile
        const { data: profileData } = await client
          .from('profiles')
          .select('*')
          .eq('wallet_address', projectData.builder_address.toLowerCase())
          .single();

        setProject({ ...projectData, builder: profileData || null });
      } catch (error) {
        console.error('Failed to fetch project:', error);
      }
    };

    fetchProject();
  }, [projectId]);

  // Estimate gas when amount or chain changes
  useEffect(() => {
    if (!authenticated || !amount || !user?.wallet?.address || !project?.builder_address) {
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
        const to = project.builder_address as Address;

        const [gasEstimate, price] = await Promise.all([
          estimateGas(selectedChainId, from, to, amountWei),
          getGasPrice(selectedChainId),
        ]);

        setEstimatedGas(gasEstimate);
        setGasPrice(price);
      } catch (err) {
        console.error('Failed to estimate gas:', err);
        setEstimatedGas(null);
        setGasPrice(null);
      }
    };

    estimate();
  }, [authenticated, amount, user?.wallet?.address, project?.builder_address, selectedChainId]);

  const handlePresetClick = (preset: number) => {
    setAmount(preset.toString());
    setSelectedPreset(preset);
  };

  const handleSend = async () => {
    if (!authenticated || !user?.wallet?.address || !project) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setError('');
    setTxState('loading');

    try {
      const wallet = wallets.find((w) => w.address.toLowerCase() === user.wallet?.address?.toLowerCase());
      if (!wallet) {
        throw new Error('Wallet not found. Please ensure your wallet is connected.');
      }

      // Get chain configuration
      const chainConfig = getChainConfig(selectedChainId);
      const chains: Record<SupportedChainId, Chain> = {
        8453: base,
        42220: celo,
      };
      const chain = chains[selectedChainId];

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

      // Parse amount
      const amountWei = parseEther(amount);
      const platformFee = calculatePlatformFee(amountWei);
      const amountAfterFee = calculateAmountAfterFee(amountWei);

      // Send transaction
      const hash = await walletClient.sendTransaction({
        to: project.builder_address as Address,
        value: amountAfterFee, // Send amount after platform fee
        account: user.wallet.address as Address,
      });

      setTxHash(hash);
      setTxState('success');

      // Save to Supabase with project_id
      if (supabaseClient) {
        const { error: dbError } = await supabaseClient.from('supports').insert({
          from_address: user.wallet.address.toLowerCase(),
          to_address: project.builder_address.toLowerCase(),
          amount: formatEther(amountAfterFee),
          message: message || null,
          tx_hash: hash,
          chain_id: selectedChainId,
          project_id: projectId,
          status: 'pending',
        });

        if (dbError) {
          console.error('Failed to save to database:', dbError);
        } else {
          // Create notification for builder
          await notifyProjectFunding(
            project.builder_address.toLowerCase(),
            user.wallet.address.toLowerCase(),
            projectId,
            Number(formatEther(amountAfterFee)),
            selectedChainId,
            hash
          );
        }
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/projects/${projectId}`);
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

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-zinc-600 dark:text-zinc-400">Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/projects/${projectId}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-[#FFBF00] dark:text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="relative h-48 w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                    Support {project.title}
                  </h1>
                  <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {project.description}
                  </p>
                  {project.what_building && (
                    <div className="mb-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        🚀 {project.what_building}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        Your support helps this project move forward
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={project.builder?.avatar_url}
                      alt={project.builder?.username || 'Builder'}
                      fallback={project.builder?.username?.charAt(0).toUpperCase() || '?'}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {project.builder?.username || formatAddress(project.builder_address)}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">
                        {formatAddress(project.builder_address)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funding Form */}
              <Card>
                <CardHeader title="Enter Amount" />
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Amount ({getChainConfig(selectedChainId).currency})
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Quick amounts</p>
                      <div className="grid grid-cols-4 gap-2">
                        {AMOUNT_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handlePresetClick(preset)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                              selectedPreset === preset
                                ? 'border-[#FFBF00] bg-[#FFBF00] text-black'
                                : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Network
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {SUPPORTED_CHAINS.map((chain) => (
                          <button
                            key={chain.id}
                            onClick={() => setSelectedChainId(chain.id)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                              selectedChainId === chain.id
                                ? 'border-[#FFBF00] bg-[#FFBF00] text-black'
                                : 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                            }`}
                          >
                            {chain.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Message (optional)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message of support..."
                        rows={3}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm placeholder-zinc-500 focus:border-[#FFBF00] focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleSend}
                      disabled={txState === 'loading' || !authenticated}
                      className="w-full"
                      size="lg"
                    >
                      {txState === 'loading' ? 'Processing...' : 'Send Support'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader title="Funding Summary" />
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">You'll send</span>
                      <span className="font-medium text-foreground">
                        {amount || '0.00'} {getChainConfig(selectedChainId).currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Platform fee (3%)</span>
                      <span className="font-medium text-foreground">
                        {amount ? (parseFloat(amount) * 0.03).toFixed(4) : '0.00'} {getChainConfig(selectedChainId).currency}
                      </span>
                    </div>
                    <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-foreground">Builder receives</span>
                        <span className="font-bold text-foreground">
                          {amount ? (parseFloat(amount) * 0.97).toFixed(4) : '0.00'} {getChainConfig(selectedChainId).currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gas Info */}
              {estimatedGas && gasPrice && (
                <Card>
                  <CardHeader title="Gas Estimate" />
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Gas limit</span>
                        <span className="font-medium text-foreground">
                          {estimatedGas.toString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Gas price</span>
                        <span className="font-medium text-foreground">
                          {gasPrice.toString()} gwei
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {txState === 'success' && (
            <Card className="border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600 dark:text-green-400" />
                <h2 className="mb-2 text-2xl font-bold text-green-900 dark:text-green-100">
                  You funded {project.title}!
                </h2>
                <p className="mb-4 text-green-800 dark:text-green-200">
                  Your contribution has been sent successfully.
                </p>
                {txHash && (
                  <a
                    href={getExplorerUrl(selectedChainId, txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-700 underline hover:text-green-900 dark:text-green-300"
                  >
                    View on {getChainConfig(selectedChainId).name} Explorer
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
      </main>
    </div>
  );
}
