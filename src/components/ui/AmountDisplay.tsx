import { forwardRef, type HTMLAttributes } from 'react';
import { cn, formatCurrency } from '../../lib/utils';

export interface AmountDisplayProps extends HTMLAttributes<HTMLDivElement> {
  amount: number;
  currency?: string;
  type?: 'neutral' | 'positive' | 'negative';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AmountDisplay = forwardRef<HTMLDivElement, AmountDisplayProps>(
  ({ className, amount, currency = 'INR', type = 'neutral', size = 'md', ...props }, ref) => {
    const isNegative = amount < 0;
    const displayAmount = Math.abs(amount);
    
    // Determine sign string for display based on type
    let prefix = '';
    if (type === 'negative' || (type === 'neutral' && isNegative)) prefix = '-';
    if (type === 'positive') prefix = '+';

    const colors = {
      neutral: 'text-gray-900',
      positive: 'text-emerald-600',
      negative: 'text-red-500',
    };

    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-2xl font-bold tracking-tight',
      xl: 'text-4xl font-bold tracking-tight',
    };

    return (
      <div
        ref={ref}
        className={cn('font-semibold tabular-nums', colors[type], sizes[size], className)}
        {...props}
      >
        {prefix}{formatCurrency(displayAmount, currency)}
      </div>
    );
  }
);
AmountDisplay.displayName = 'AmountDisplay';
