import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getTokenSymbol, type SupportedChainId } from '@/lib/blockchain';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format amount with token symbol
 */
export function formatAmountWithToken(amount: number, chainId: number): string {
  try {
    const symbol = getTokenSymbol(chainId as SupportedChainId);
    return `${amount.toFixed(4)} ${symbol}`;
  } catch {
    return `${amount.toFixed(4)} ETH`;
  }
}

/**
 * Get the base URL for the application
 * For shareable links, always use production URL
 * Can be overridden with NEXT_PUBLIC_APP_URL env variable
 */
export function getBaseUrl(): string {
  // Allow override via environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Always use production URL for shareable links
  return 'https://gasmeup-sable.vercel.app';
}
