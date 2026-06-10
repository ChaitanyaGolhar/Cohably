import { useNavigate } from 'react-router-dom';
import { RefreshCw, ClipboardList, Bell, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRotations } from '../hooks/useRotations';
import { useTasks } from '../hooks/useTasks';
import { useBillReminders } from '../hooks/useBillReminders';
import { FlatHubCard } from '../components/flat/FlatHubCard';
import { EmptyFlatHub } from '../components/flat/EmptyFlatHub';

export default function FlatHubPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const flatId = user?.membership?.flatId;

  const { rotations, isLoading: loadingRot } = useRotations(flatId);
  const { tasks, isLoading: loadingTasks } = useTasks(flatId);
  const { bills, isLoading: loadingBills } = useBillReminders(flatId);

  const activeRotations = rotations.filter((r: any) => r.isActive);
  const nextRotationCycle = activeRotations
    .map((r: any) => r.currentCycle)
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const pendingTasks = tasks.filter((t: any) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  const overdueTasks = pendingTasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date());

  const activeBills = bills.filter((b: any) => b.isActive);
  const nextBill = activeBills.sort((a: any, b: any) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];

  const isLoading = loadingRot || loadingTasks || loadingBills;
  const isCompletelyEmpty = activeRotations.length === 0 && tasks.length === 0 && activeBills.length === 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isCompletelyEmpty) {
    return (
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Flat</h1>
        <EmptyFlatHub
          icon={<Building2 className="w-8 h-8" />}
          title="Your flat is all set up"
          description="Add rotations, tasks, or bill reminders to get started"
        />
        <div className="mt-6 flex flex-col gap-3">
          <button onClick={() => navigate('/flat/rotations')} className="bg-violet-50 text-violet-700 py-3 rounded-xl font-medium">Set up Rotations</button>
          <button onClick={() => navigate('/flat/tasks')} className="bg-cyan-50 text-cyan-700 py-3 rounded-xl font-medium">Create a Task</button>
          <button onClick={() => navigate('/flat/bills')} className="bg-amber-50 text-amber-700 py-3 rounded-xl font-medium">Add Bill Reminder</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 sm:pb-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Flat</h1>
      
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        <div onClick={() => navigate('/flat/rotations')} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer hover:bg-violet-100">
          <span className="w-2 h-2 rounded-full bg-violet-500"></span>
          {activeRotations.length} Rotations active
        </div>
        <div onClick={() => navigate('/flat/tasks')} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer hover:bg-cyan-100">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          {pendingTasks.length} Tasks pending
        </div>
        <div onClick={() => navigate('/flat/bills')} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer hover:bg-amber-100">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {activeBills.length} Bills due soon
        </div>
      </div>

      <div className="space-y-4">
        <FlatHubCard
          title="Rotations"
          icon={RefreshCw}
          count={activeRotations.length}
          subtitle={nextRotationCycle ? `Next due: ${nextRotationCycle.assignedTo.name}` : 'No upcoming cycles'}
          color="violet"
          onTap={() => navigate('/flat/rotations')}
        />

        <FlatHubCard
          title="Tasks"
          icon={ClipboardList}
          count={pendingTasks.length}
          subtitle={
            overdueTasks.length > 0 ? (
              <span className="text-red-500 font-medium">{overdueTasks.length} overdue</span>
            ) : (
              'All tasks on track'
            )
          }
          color="cyan"
          onTap={() => navigate('/flat/tasks')}
        />

        <FlatHubCard
          title="Bill Reminders"
          icon={Bell}
          count={activeBills.length}
          subtitle={
            nextBill ? (
              <span>Next: {nextBill.title} ({new Date(nextBill.nextDueDate).toLocaleDateString()})</span>
            ) : (
              'No upcoming bills'
            )
          }
          color="amber"
          onTap={() => navigate('/flat/bills')}
        />
      </div>
    </div>
  );
}
