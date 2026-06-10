import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MoreVertical, SkipForward } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRotation } from '../hooks/useRotation';
import { Button } from '../components/ui/Button';
import { CycleStatusBadge } from '../components/rotations/CycleStatusBadge';
import { AssigneeChip } from '../components/ui/AssigneeChip';
import { MemberRotationStat } from '../components/rotations/MemberRotationStat';
import { RotationLogRow } from '../components/rotations/RotationLogRow';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Textarea } from '../components/ui/Textarea';

export default function RotationDetailPage() {
  const { rotId } = useParams<{ rotId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const flatId = user?.membership?.flatId;
  const isAdmin = user?.membership?.role === 'ADMIN';

  const { rotation, isLoading, history, isHistoryLoading, completeCycle, isCompleting, skipCycle, isSkipping, deleteRotation } = useRotation(flatId, rotId);

  const [skipSheetOpen, setSkipSheetOpen] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this rotation?')) {
      deleteRotation(undefined, {
        onSuccess: () => navigate('/flat/rotations')
      });
    }
  };

  if (isLoading || !rotation) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentCycle = rotation.currentCycle;
  const isAssigned = currentCycle?.assignedTo?.id === user?.id;
  const isPendingOrOverdue = currentCycle && (currentCycle.status === 'PENDING' || currentCycle.status === 'OVERDUE');

  const handleSkip = () => {
    if (!skipReason.trim()) return;
    skipCycle({ cycleId: currentCycle!.id, reason: skipReason }, {
      onSuccess: () => {
        setSkipSheetOpen(false);
        setSkipReason('');
      }
    });
  };

  return (
    <div className="pb-20 sm:pb-0 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/flat/rotations')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{rotation.name}</h1>
        </div>
        {isAdmin && (
          <DropdownMenu
            trigger={
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            }
            items={[
              { label: 'Delete Rotation', onClick: handleDelete, variant: 'danger' }
            ]}
          />
        )}
      </div>

      {/* Current Cycle Card */}
      <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
        <h2 className="text-sm font-semibold text-violet-900 mb-4">Current cycle</h2>
        
        {currentCycle ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <AssigneeChip user={currentCycle.assignedTo as any} isCurrentUser={isAssigned} />
              <CycleStatusBadge status={currentCycle.status} />
            </div>
            
            <p className="text-xs text-violet-600 font-medium">
              Due {new Date(currentCycle.dueDate).toLocaleDateString()}
            </p>

            {isPendingOrOverdue && isAssigned && (
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700" 
                onClick={() => completeCycle(currentCycle.id)}
                isLoading={isCompleting}
              >
                Mark as done
              </Button>
            )}

            {isPendingOrOverdue && isAdmin && (
              <div className="text-center mt-2">
                <button 
                  onClick={() => setSkipSheetOpen(true)}
                  className="text-xs font-medium text-violet-600 hover:text-violet-800 underline underline-offset-2"
                >
                  Skip cycle
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-violet-700">No active cycle.</div>
        )}
      </div>

      {/* Fair Distribution */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Completion history</h3>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          {history?.stats.length ? (
            history.stats.map((stat: any) => (
              <MemberRotationStat key={stat.userId} stat={stat} />
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No completion history yet</p>
          )}
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Members in rotation</h3>
          {isAdmin && (
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Manage members</button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {rotation.members?.map((m: any) => (
            <AssigneeChip key={m.userId} user={m.user} isCurrentUser={m.userId === user?.id} />
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Rotation history</h3>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          {isHistoryLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-full"></div>
            </div>
          ) : history?.logs.length ? (
            <>
              {history.logs.map((log: any) => (
                <RotationLogRow key={log.id} log={log} />
              ))}
              <div className="text-center mt-4 pt-2 border-t border-gray-50">
                <button className="text-sm font-medium text-gray-500 hover:text-gray-700">Load more</button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 flex flex-col items-center">
              <Clock className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-900">No history</p>
              <p className="text-xs text-gray-500 mt-1">History will appear after first cycle</p>
            </div>
          )}
        </div>
      </div>

      {/* Skip Cycle Sheet */}
      <BottomSheet isOpen={skipSheetOpen} onClose={() => setSkipSheetOpen(false)} title="Skip Cycle">
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Skipping this cycle will immediately assign the duty to the next person in line.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for skipping</label>
            <Textarea 
              value={skipReason} 
              onChange={(e) => setSkipReason(e.target.value)} 
              placeholder="e.g. Rahul is travelling"
              rows={3}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleSkip} 
            disabled={!skipReason.trim()}
            isLoading={isSkipping}
          >
            Confirm Skip
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
