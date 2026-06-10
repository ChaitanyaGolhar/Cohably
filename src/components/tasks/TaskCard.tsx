import { ChevronRight } from 'lucide-react';
import type { Task } from '../../types/api';
import { TaskStatusBadge } from './TaskStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { AssigneeChip } from '../ui/AssigneeChip';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore(s => s.user?.id);
  
  const isCompleted = task.status === 'COMPLETED';
  const isCancelled = task.status === 'CANCELLED';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted && !isCancelled;
  const isCurrentUser = task.assignedTo?.id === currentUserId;

  return (
    <div 
      onClick={() => navigate(`/flat/tasks/${task.id}`)}
      className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between ${isCompleted || isCancelled ? 'opacity-70 border-gray-100' : 'border-gray-100 border-l-4 border-l-cyan-500'}`}
    >
      <div className="flex items-center gap-3">
        <TaskStatusBadge status={task.status} showLabel={false} className="flex-shrink-0" />
      </div>

      <div className="flex-1 min-w-0 px-3">
        <h3 className={`font-semibold truncate mb-1.5 ${isCompleted || isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
          {task.title}
        </h3>
        
        <div className="flex items-center gap-3">
          <AssigneeChip user={task.assignedTo as any} isCurrentUser={isCurrentUser} />
          {task.dueDate && (
            <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <PriorityBadge priority={task.priority} showLabel={false} />
        <ChevronRight className="w-5 h-5 text-gray-300" />
      </div>
    </div>
  );
}
