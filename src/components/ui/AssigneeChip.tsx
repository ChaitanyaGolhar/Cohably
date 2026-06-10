import { Avatar } from './Avatar';
import { cn } from '../../lib/utils';

interface AssigneeChipProps {
  user?: { name: string; id: string; avatarUrl?: string | null };
  isCurrentUser?: boolean;
}

export function AssigneeChip({ user, isCurrentUser }: AssigneeChipProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-[10px] font-bold">?</span>
        </div>
        <span className="text-xs font-medium text-gray-500 pr-1">Unassigned</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-2 py-1 rounded-full border",
        isCurrentUser 
          ? "bg-violet-50 border-violet-200 text-violet-700" 
          : "bg-gray-50 border-gray-200 text-gray-700"
      )}
    >
      <Avatar src={user.avatarUrl} name={user.name} size="sm" />
      <span className="text-xs font-medium pr-1">
        {isCurrentUser ? 'You' : user.name}
      </span>
    </div>
  );
}
