import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTask } from '../hooks/useTask';
import { Button } from '../components/ui/Button';
import { TaskStatusBadge } from '../components/tasks/TaskStatusBadge';
import { PriorityBadge } from '../components/tasks/PriorityBadge';
import { AssigneeChip } from '../components/ui/AssigneeChip';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { formatTimeAgo } from '../lib/utils';

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const flatId = user?.membership?.flatId;
  const isAdmin = user?.membership?.role === 'ADMIN';

  const { task, isLoading, assignTask, isAssigning, markInProgress, isMarkingInProgress, completeTask, isCompleting, cancelTask, isCancelling } = useTask(flatId, taskId);

  if (isLoading || !task) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAssignedToMe = task.assignedTo?.id === user?.id;
  const isCreator = task.createdBy?.id === user?.id;
  const canEdit = isAdmin || isCreator;
  const isPendingOrProgress = task.status === 'PENDING' || task.status === 'IN_PROGRESS';

  const handleSelfAssign = () => {
    if (!user) return;
    assignTask(user.id);
  };

  return (
    <div className="pb-20 sm:pb-0 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/flat/tasks')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-500">Task Details</span>
        </div>
        {canEdit && (
          <DropdownMenu
            trigger={
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            }
            items={[
              { label: 'Edit Task', onClick: () => {} },
              { label: 'Delete Task', onClick: () => {}, variant: 'danger' }
            ]}
          />
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <TaskStatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
        
        {task.description && (
          <p className="text-gray-600 text-sm whitespace-pre-wrap mb-4">
            {task.description}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Assigned to</span>
          {task.assignedTo ? (
            <AssigneeChip user={task.assignedTo as any} isCurrentUser={isAssignedToMe} />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Unassigned</span>
              {isPendingOrProgress && (
                <button 
                  onClick={handleSelfAssign}
                  disabled={isAssigning}
                  className="text-xs font-medium text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-2 py-1 rounded-full"
                >
                  {isAssigning ? 'Assigning...' : 'Assign to me'}
                </button>
              )}
            </div>
          )}
        </div>
        
        {task.dueDate && (
          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
            <span className="text-sm text-gray-500 font-medium">Due Date</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <span className="text-sm text-gray-500 font-medium">Created by</span>
          <span className="text-sm font-medium text-gray-900">{task.createdBy?.name || 'Unknown'}</span>
        </div>
      </div>

      {isPendingOrProgress && isAssignedToMe && (
        <div className="flex flex-col gap-3">
          {task.status === 'PENDING' && (
            <Button 
              variant="secondary"
              className="w-full" 
              onClick={() => markInProgress()}
              isLoading={isMarkingInProgress}
            >
              Mark in progress
            </Button>
          )}
          <Button 
            className="w-full bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500" 
            onClick={() => completeTask()}
            isLoading={isCompleting}
          >
            Mark as complete
          </Button>
        </div>
      )}

      {isPendingOrProgress && isAdmin && !isAssignedToMe && (
        <div className="flex flex-col gap-3">
          <Button 
            variant="danger"
            className="w-full" 
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this task?')) {
                cancelTask();
              }
            }}
            isLoading={isCancelling}
          >
            Cancel task
          </Button>
        </div>
      )}

      {task.status === 'COMPLETED' && task.completedAt && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Completed {formatTimeAgo(task.completedAt)}
        </div>
      )}
    </div>
  );
}
