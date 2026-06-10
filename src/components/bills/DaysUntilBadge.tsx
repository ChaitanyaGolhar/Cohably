import { cn } from '../../lib/utils';
import { Clock } from 'lucide-react';

interface DaysUntilBadgeProps {
  nextDueDate: string;
  className?: string;
}

export function DaysUntilBadge({ nextDueDate, className }: DaysUntilBadgeProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(nextDueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let config = { text: `${diffDays} days`, colors: 'bg-gray-100 text-gray-700' };

  if (diffDays < 0) {
    config = { text: 'Overdue', colors: 'bg-red-100 text-red-700' };
  } else if (diffDays === 0) {
    config = { text: 'Due today', colors: 'bg-amber-100 text-amber-700' };
  } else if (diffDays <= 3) {
    config = { text: `${diffDays} days`, colors: 'bg-amber-100 text-amber-700' };
  }

  return (
    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", config.colors, className)}>
      <Clock className="w-3 h-3" />
      {config.text}
    </div>
  );
}
