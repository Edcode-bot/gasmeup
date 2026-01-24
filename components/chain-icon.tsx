import { Circle } from 'lucide-react';
import type { SupportedChainId } from '@/lib/blockchain';

interface ChainIconProps {
  chainId: SupportedChainId | number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ChainIcon({ chainId, size = 'md', showLabel = false, className = '' }: ChainIconProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const chainInfo = {
    8453: { name: 'Base', color: 'bg-blue-500', label: '🔵 Base' },
    42220: { name: 'Celo', color: 'bg-yellow-500', label: '🟡 Celo' },
    11155111: { name: 'Sepolia', color: 'bg-purple-500', label: '🟣 Sepolia' },
    44787: { name: 'Celo Alfajores', color: 'bg-orange-500', label: '🟠 Alfajores' }
  };

  const info = chainInfo[chainId as keyof typeof chainInfo] || { name: 'Unknown', color: 'bg-gray-500', label: '⚪ Unknown' };

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1 text-sm ${className}`}>
        <Circle className={`${sizeClasses[size]} ${info.color} fill-current`} />
        {info.label}
      </span>
    );
  }

  return (
    <Circle className={`${sizeClasses[size]} ${info.color} fill-current ${className}`} />
  );
}

// Component for displaying token amount with chain icon
export function TokenAmountWithChain({ 
  amount, 
  chainId, 
  tokenSymbol,
  className = '' 
}: { 
  amount: number; 
  chainId: SupportedChainId | number; 
  tokenSymbol?: string;
  className?: string;
}) {
  const getChainSymbol = (chainId: SupportedChainId | number) => {
    switch (chainId) {
      case 8453: return 'ETH';
      case 42220: return 'CELO';
      case 11155111: return 'ETH';
      case 44787: return 'CELO';
      default: return 'ETH';
    }
  };

  const symbol = tokenSymbol || getChainSymbol(chainId);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <ChainIcon chainId={chainId} size="sm" />
      <span className="font-medium">
        {amount.toFixed(4)} {symbol}
      </span>
    </div>
  );
}
