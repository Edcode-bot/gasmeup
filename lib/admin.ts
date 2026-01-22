/**
 * Check if a wallet address is an admin
 * Only these two wallet addresses are admins:
 * - 0x485a01e83C7f89C22d57713191Ee946a607e91EC
 * - 0xb614ab5731bdabe6d326026f85e3e1fce592c4d0
 */
export function isAdmin(walletAddress: string | null | undefined): boolean {
  if (!walletAddress) return false;

  const adminWallets = [
    '0x485a01e83C7f89C22d57713191Ee946a607e91EC',
    '0xb614ab5731bdabe6d326026f85e3e1fce592c4d0',
  ];

  return adminWallets.some(
    (adminWallet) => adminWallet.toLowerCase().trim() === walletAddress.toLowerCase()
  );
}
