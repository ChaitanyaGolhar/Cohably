import { cn } from '../../lib/utils';
import type { TaskPriority } from '../../types/api';
import { ChevronsUp, ChevronUp, ChevronDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  showLabel?: boolean;
}

export function PriorityBadge({ priority, className, showLabel = true }: PriorityBadgeProps) {
  let config = { icon: ChevronUp, text: 'Medium', colors: 'text-amber-600 bg-amber-50 border-amber-200' };

  if (priority === 'HIGH') {
    config = { icon: ChevronsUp, text: 'High', colors: 'text-red-600 bg-red-50 border-red-200' };
  } else if (priority === 'LOW') {
    config = { icon: ChevronDown, text: 'Low', colors: 'text-gray-600 bg-gray-50 border-gray-200' };
  }

  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-0.5", showLabel ? `px-2 py-0.5 rounded-full border text-[10px] font-medium ${config.colors}` : config.colors.split(' ')[0], className)}>
      <Icon className="w-3 h-3" />
      {showLabel && config.text}
    </div>
  );
}
