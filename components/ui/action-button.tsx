import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onClick,
  className = ''
}: ActionButtonProps) {
  const getButtonVariant = () => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'ghost':
        return 'ghost';
      default:
        return 'default';
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      default:
        return 'default';
    }
  };

  const renderIcon = () => {
    if (!Icon) return null;
    return <Icon className="h-4 w-4" />;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-[#FFBF00]" />
          {children}
        </>
      );
    }

    if (Icon && iconPosition === 'left') {
      return (
        <>
          {renderIcon()}
          {children}
        </>
      );
    }

    if (Icon && iconPosition === 'right') {
      return (
        <>
          {children}
          {renderIcon()}
        </>
      );
    }

    return children;
  };

  return (
    <Button
      variant={getButtonVariant()}
      size={getButtonSize()}
      disabled={disabled || loading}
      onClick={onClick}
      className={className}
    >
      {renderContent()}
    </Button>
  );
}
