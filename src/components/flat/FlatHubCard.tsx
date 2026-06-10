import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FlatHubCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  subtitle: React.ReactNode;
  color: 'violet' | 'cyan' | 'amber';
  onTap: () => void;
}

export function FlatHubCard({ title, icon: Icon, count, subtitle, color, onTap }: FlatHubCardProps) {
  const colorMap = {
    violet: {
      border: 'border-l-violet-500',
      iconText: 'text-violet-600',
      iconBg: 'bg-violet-100',
      countText: 'text-violet-600'
    },
    cyan: {
      border: 'border-l-cyan-500',
      iconText: 'text-cyan-600',
      iconBg: 'bg-cyan-100',
      countText: 'text-cyan-600'
    },
    amber: {
      border: 'border-l-amber-500',
      iconText: 'text-amber-600',
      iconBg: 'bg-amber-100',
      countText: 'text-amber-600'
    }
  };

  const theme = colorMap[color];

  return (
    <div 
      onClick={onTap}
      className={cn(
        "bg-white rounded-2xl p-5 border shadow-sm cursor-pointer hover:shadow-md transition-shadow border-l-4",
        theme.border
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className={cn("p-2 rounded-xl", theme.iconBg)}>
          <Icon className={cn("w-6 h-6", theme.iconText)} />
        </div>
      </div>
      
      <div>
        <div className={cn("text-3xl font-bold mb-1", theme.countText)}>
          {count}
        </div>
        <div className="text-sm text-gray-500 truncate">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
