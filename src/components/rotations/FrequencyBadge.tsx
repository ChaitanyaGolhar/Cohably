import { cn } from '../../lib/utils';
import type { RotationFrequency } from '../../types/api';

interface FrequencyBadgeProps {
  frequency: RotationFrequency;
  className?: string;
}

export function FrequencyBadge({ frequency, className }: FrequencyBadgeProps) {
  const label = frequency.replace('_', ' ').toLowerCase();
  
  return (
    <span className={cn("px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-semibold tracking-wide uppercase", className)}>
      {label}
    </span>
  );
}
