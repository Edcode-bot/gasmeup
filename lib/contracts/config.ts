import GasMeUpABI from './GasMeUp.json';

export const GASMEUP_ABI = GasMeUpABI;

// Contract addresses by chain ID
export const CONTRACT_ADDRESSES: Record<number, string> = {
  42220: process.env.NEXT_PUBLIC_CONTRACT_CELO || "", // Celo
  8453: process.env.NEXT_PUBLIC_CONTRACT_BASE || "", // Base
};

export function getContractAddress(chainId: number): string | null {
  const address = CONTRACT_ADDRESSES[chainId];
  return address || null;
}

export function isContractDeployed(chainId: number): boolean {
  return !!getContractAddress(chainId);
}

export const SUPPORTED_CONTRACT_CHAINS = [42220, 8453]; // Celo + Base
