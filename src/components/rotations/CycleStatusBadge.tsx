import { cn } from '../../lib/utils';
import type { RotationCycle } from '../../types/api';
import { Clock, CheckCircle2, AlertCircle, SkipForward } from 'lucide-react';

interface CycleStatusBadgeProps {
  status: RotationCycle['status'];
  className?: string;
}

export function CycleStatusBadge({ status, className }: CycleStatusBadgeProps) {
  let config = {
    icon: Clock,
    text: 'Pending',
    colors: 'bg-violet-100 text-violet-700',
  };

  if (status === 'COMPLETED') {
    config = { icon: CheckCircle2, text: 'Completed', colors: 'bg-emerald-100 text-emerald-700' };
  } else if (status === 'OVERDUE') {
    config = { icon: AlertCircle, text: 'Overdue', colors: 'bg-red-100 text-red-700' };
  } else if (status === 'SKIPPED') {
    config = { icon: SkipForward, text: 'Skipped', colors: 'bg-gray-100 text-gray-700' };
  }

  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", config.colors, className)}>
      <Icon className="w-3 h-3" />
      {config.text}
    </div>
  );
}
