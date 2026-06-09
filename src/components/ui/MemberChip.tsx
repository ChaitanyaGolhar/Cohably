import { forwardRef, type HTMLAttributes } from 'react';
import { Avatar } from './Avatar';
import { cn } from '../../lib/utils';

export interface MemberChipProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  avatarUrl?: string | null;
  selected?: boolean;
}

export const MemberChip = forwardRef<HTMLDivElement, MemberChipProps>(
  ({ className, name, avatarUrl, selected, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 pr-3 text-sm font-medium transition-colors hover:bg-gray-50 cursor-pointer',
          selected && 'border-indigo-600 bg-indigo-50 hover:bg-indigo-50 text-indigo-900',
          className
        )}
        {...props}
      >
        <Avatar src={avatarUrl} name={name} size="sm" />
        <span className="max-w-[100px] truncate">{name.split(' ')[0]}</span>
      </div>
    );
  }
);
MemberChip.displayName = 'MemberChip';
