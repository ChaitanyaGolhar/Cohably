import { cn } from '../../lib/utils';
import type { TaskStatus } from '../../types/api';
import { Circle, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
  showLabel?: boolean;
}

export function TaskStatusBadge({ status, className, showLabel = true }: TaskStatusBadgeProps) {
  let config = { icon: Circle, text: 'Pending', colors: 'text-gray-500 bg-gray-100' };

  if (status === 'IN_PROGRESS') {
    config = { icon: Loader2, text: 'In Progress', colors: 'text-cyan-600 bg-cyan-50' };
  } else if (status === 'COMPLETED') {
    config = { icon: CheckCircle2, text: 'Completed', colors: 'text-emerald-600 bg-emerald-50' };
  } else if (status === 'CANCELLED') {
    config = { icon: XCircle, text: 'Cancelled', colors: 'text-gray-400 bg-gray-100' };
  }

  const Icon = config.icon;
  const isSpinning = status === 'IN_PROGRESS';

  return (
    <div className={cn("inline-flex items-center gap-1", showLabel ? `px-2 py-0.5 rounded-full text-[10px] font-medium ${config.colors}` : '', className)}>
      <Icon className={cn("w-4 h-4", isSpinning && "animate-spin", !showLabel && config.colors.split(' ')[0])} />
      {showLabel && config.text}
    </div>
  );
}
