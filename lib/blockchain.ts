import { parseEther, formatEther, type Address } from 'viem';
import { createPublicClient, http, type Chain } from 'viem';
import { celo, base } from 'viem/chains';
import { getContractAddress, GASMEUP_ABI, isContractDeployed } from './contracts/config';

// Chain configurations
export const SUPPORTED_CHAINS = {
  42220: {
    ...celo,
    name: 'Celo',
    explorer: 'https://celoscan.io',
    currency: 'CELO',
    token: 'CELO',
    rpc: 'https://forno.celo.org',
  },
  8453: {
    ...base,
    name: 'Base',
    explorer: 'https://basescan.org',
    currency: 'ETH',
    token: 'ETH',
    rpc: 'https://mainnet.base.org',
  },
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

// Platform fee: 3% = 300 basis points
const PLATFORM_FEE_BPS = 300; // 3%
const PLATFORM_FEE_RECIPIENT = '0x0000000000000000000000000000000000000000' as Address; // TODO: Set your platform fee recipient

/**
 * Calculate platform fee (3%)
 */
export function calculatePlatformFee(amount: bigint): bigint {
  return (amount * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000);
}

/**
 * Calculate amount after platform fee
 */
export function calculateAmountAfterFee(amount: bigint): bigint {
  return amount - calculatePlatformFee(amount);
}

/**
 * Get block explorer URL for a transaction
 */
export function getExplorerUrl(chainId: SupportedChainId, txHash: string): string {
  const chain = SUPPORTED_CHAINS[chainId];
  return `${chain.explorer}/tx/${txHash}`;
}

/**
 * Get chain configuration
 */
export function getChainConfig(chainId: SupportedChainId) {
  return SUPPORTED_CHAINS[chainId];
}

/**
 * Get token symbol for a chain
 */
export function getTokenSymbol(chainId: SupportedChainId): string {
  return SUPPORTED_CHAINS[chainId].currency;
}

/**
 * Check transaction status on blockchain
 */
export async function getTransactionStatus(
  chainId: SupportedChainId,
  txHash: string
): Promise<{
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: bigint;
  confirmations?: number;
  actualAmount?: bigint;
  error?: string;
}> {
  const client = createChainClient(chainId);
  
  try {
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
    
    if (!receipt) {
      return { status: 'pending' };
    }

    if (receipt.status === 'reverted') {
      return {
        status: 'failed',
        blockNumber: receipt.blockNumber,
        error: 'Transaction reverted',
      };
    }

    const transaction = await client.getTransaction({ hash: txHash as `0x${string}` });
    const currentBlock = await client.getBlockNumber();
    const confirmations = Number(currentBlock - receipt.blockNumber);

    return {
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      confirmations,
      actualAmount: transaction.value,
    };
  } catch (error: any) {
    // Transaction not found or other error
    if (error?.message?.includes('not found') || error?.code === 'TRANSACTION_NOT_FOUND') {
      return { status: 'pending' };
    }
    return {
      status: 'failed',
      error: error?.message || 'Unknown error',
    };
  }
}

/**
 * Create a public client for a chain
 */
export function createChainClient(chainId: SupportedChainId) {
  const chain = SUPPORTED_CHAINS[chainId];
  return createPublicClient({
    chain: chain as Chain,
    transport: http(),
  });
}

/**
 * Estimate gas for sending ETH/MATIC
 */
export async function estimateGas(
  chainId: SupportedChainId,
  from: Address,
  to: Address,
  value: bigint
): Promise<bigint> {
  const client = createChainClient(chainId);
  const gasEstimate = await client.estimateGas({
    account: from,
    to,
    value,
  });
  return gasEstimate;
}

/**
 * Get current gas price for a chain
 */
export async function getGasPrice(chainId: SupportedChainId): Promise<bigint> {
  const client = createChainClient(chainId);
  const gasPrice = await client.getGasPrice();
  return gasPrice;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: string, chainId: SupportedChainId): string {
  const chain = SUPPORTED_CHAINS[chainId];
  try {
    const parsed = parseEther(amount);
    return `${formatEther(parsed)} ${chain.currency}`;
  } catch {
    return `${amount} ${chain.currency}`;
  }
}

/**
 * Get chain by ID (helper for contract functions)
 */
export function getChainById(chainId: number): Chain {
  const chain = SUPPORTED_CHAINS[chainId as SupportedChainId];
  return chain as Chain;
}

/**
 * Send support via smart contract
 */
export async function sendSupport(
  walletClient: any,
  toAddress: string,
  amount: string,
  message: string,
  chainId: number
): Promise<string> {
  try {
    const contractAddress = getContractAddress(chainId);
    
    if (!contractAddress) {
      throw new Error('Smart contract not deployed on this chain');
    }
    
    const amountWei = parseEther(amount);
    
    console.log('Sending support via contract:', {
      contract: contractAddress,
      to: toAddress,
      amount: amount,
      chain: chainId
    });
    
    // Call GasMeUp contract's support() function
    const hash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: GASMEUP_ABI,
      functionName: 'support',
      args: [toAddress, message],
      value: amountWei
    });
    
    return hash;
  } catch (error) {
    console.error('Contract support failed:', error);
    throw error;
  }
}

/**
 * Calculate contract fee for display
 */
export async function calculateContractFee(
  amount: string,
  chainId: number
): Promise<{ fee: string; builderAmount: string } | null> {
  try {
    const contractAddress = getContractAddress(chainId);
    if (!contractAddress) return null;
    
    const publicClient = createPublicClient({
      chain: getChainById(chainId),
      transport: http()
    });
    
    const amountWei = parseEther(amount);
    
    const result = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: GASMEUP_ABI,
      functionName: 'calculateFee',
      args: [amountWei]
    }) as [bigint, bigint];
    
    return {
      fee: formatEther(result[0]),
      builderAmount: formatEther(result[1])
    };
  } catch (error) {
    console.error('Fee calculation failed:', error);
    return null;
  }
}
