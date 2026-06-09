import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import * as Icons from 'lucide-react';

export interface CategoryBadgeProps extends HTMLAttributes<HTMLDivElement> {
  category: string;
}

export const CategoryBadge = forwardRef<HTMLDivElement, CategoryBadgeProps>(
  ({ className, category, ...props }, ref) => {
    const categoryConfig = CATEGORIES.find((c) => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
    
    // Dynamically get the icon component from lucide-react
    // Note: lucide icon names are PascalCase (e.g. ShoppingCart for 'shopping-cart')
    const IconName = categoryConfig.icon.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') as keyof typeof Icons;
    const IconComponent = Icons[IconName] as React.ElementType || Icons.Grid;

    const colorClasses: Record<string, string> = {
      amber: 'bg-amber-100 text-amber-700',
      orange: 'bg-orange-100 text-orange-700',
      blue: 'bg-blue-100 text-blue-700',
      indigo: 'bg-indigo-100 text-indigo-700',
      green: 'bg-emerald-100 text-emerald-700',
      gray: 'bg-gray-100 text-gray-700',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
          colorClasses[categoryConfig.color] || colorClasses.gray,
          className
        )}
        {...props}
      >
        <IconComponent className="h-3.5 w-3.5" />
        <span>{categoryConfig.label}</span>
      </div>
    );
  }
);
CategoryBadge.displayName = 'CategoryBadge';
