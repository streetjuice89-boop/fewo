'use client';

import React from 'react';
import { cn } from '../utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-navy-light text-pearl',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-sunset/20 text-sunset',
  danger: 'bg-red-500/20 text-red-400',
  info: 'bg-ocean/20 text-ocean',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-ui',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

