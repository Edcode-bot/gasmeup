import { supabase } from '@/lib/supabase';

export interface ChainStats {
  base: {
    total: number;
    count: number;
    supporters: string[];
  };
  celo: {
    total: number;
    count: number;
    supporters: string[];
  };
  totalUSD?: number;
}

export async function getBuilderChainStats(walletAddress: string): Promise<ChainStats> {
  const { data: supports } = await supabase
    .from('supports')
    .select('amount, chain_id, from_address')
    .eq('to_address', walletAddress.toLowerCase());

  const baseSupports = supports?.filter(s => s.chain_id === 8453) || [];
  const celoSupports = supports?.filter(s => s.chain_id === 42220) || [];

  const baseTotal = baseSupports.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const celoTotal = celoSupports.reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const baseSupporters = [...new Set(baseSupports.map(s => s.from_address))];
  const celoSupporters = [...new Set(celoSupports.map(s => s.from_address))];

  return {
    base: {
      total: baseTotal,
      count: baseSupports.length,
      supporters: baseSupporters
    },
    celo: {
      total: celoTotal,
      count: celoSupports.length,
      supporters: celoSupporters
    }
  };
}

export async function getGlobalChainStats(): Promise<{
  base: { total: number; count: number };
  celo: { total: number; count: number };
  total: number;
}> {
  const { data: supports } = await supabase
    .from('supports')
    .select('amount, chain_id');

  const baseSupports = supports?.filter(s => s.chain_id === 8453) || [];
  const celoSupports = supports?.filter(s => s.chain_id === 42220) || [];

  const baseTotal = baseSupports.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const celoTotal = celoSupports.reduce((sum, s) => sum + parseFloat(s.amount), 0);

  return {
    base: {
      total: baseTotal,
      count: baseSupports.length
    },
    celo: {
      total: celoTotal,
      count: celoSupports.length
    },
    total: baseTotal + celoTotal
  };
}

// Helper to format chain-specific amounts
export function formatChainAmount(amount: number, chainId: number): string {
  if (chainId === 8453) {
    return `${amount.toFixed(4)} ETH`;
  } else if (chainId === 42220) {
    return `${amount.toFixed(4)} CELO`;
  }
  return `${amount.toFixed(4)}`;
}

// Helper to get chain badge styling
export function getChainBadgeClass(chainId: number): string {
  if (chainId === 8453) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (chainId === 42220) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

// Helper to get chain name
export function getChainName(chainId: number): string {
  if (chainId === 8453) return 'Base';
  if (chainId === 42220) return 'Celo';
  if (chainId === 11155111) return 'Sepolia';
  if (chainId === 44787) return 'Alfajores';
  return 'Unknown';
}
