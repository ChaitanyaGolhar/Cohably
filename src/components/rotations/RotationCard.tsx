import { ChevronRight } from 'lucide-react';
import type { Rotation } from '../../types/api';
import { FrequencyBadge } from './FrequencyBadge';
import { CycleStatusBadge } from './CycleStatusBadge';
import { AssigneeChip } from '../ui/AssigneeChip';
import { useAuthStore } from '../../store/authStore';
import { formatTimeAgo } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface RotationCardProps {
  rotation: Rotation;
}

export function RotationCard({ rotation }: RotationCardProps) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore(s => s.user?.id); // The V1 backend sets `user?.id` inside the store perhaps, wait: V1 backend had `req.user.userId`. Let's check `api.ts`. User has `id`. Let's use `user?.id`.
  
  const currentCycle = rotation.currentCycle;
  const isOverdue = currentCycle?.status === 'OVERDUE';
  const isCurrentUser = currentCycle?.assignedTo?.id === currentUserId;

  return (
    <div 
      onClick={() => navigate(`/flat/rotations/${rotation.id}`)}
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm border-l-4 border-l-violet-500 cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between"
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{rotation.name}</h3>
          <FrequencyBadge frequency={rotation.frequency} />
        </div>
        
        {currentCycle ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-500">Currently:</span>
              <AssigneeChip user={currentCycle.assignedTo as any} isCurrentUser={isCurrentUser} />
            </div>
            <div className="flex items-center gap-3">
              <CycleStatusBadge status={currentCycle.status} />
              <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {isOverdue ? `Overdue since ${new Date(currentCycle.dueDate).toLocaleDateString()}` : `Due ${new Date(currentCycle.dueDate).toLocaleDateString()}`}
              </span>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-500 mt-2">No active cycle</div>
        )}
      </div>
      
      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
    </div>
  );
}
