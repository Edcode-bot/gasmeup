/**
 * Admin wallet configuration
 * Configure via NEXT_PUBLIC_ADMIN_WALLETS environment variable
 * Format: "0x1234...,0xabcd..."
 */
const ADMIN_WALLETS = (process.env.NEXT_PUBLIC_ADMIN_WALLETS || '')
  .split(',')
  .map(addr => addr.trim().toLowerCase())
  .filter(addr => addr.length === 42 && addr.startsWith('0x'));

export function isAdmin(walletAddress?: string): boolean {
  if (!walletAddress) return false;
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
}

// Debug function to check current admin wallets
export function getAdminWallets(): string[] {
  return [...ADMIN_WALLETS];
}
