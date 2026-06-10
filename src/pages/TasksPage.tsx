import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFlatStore } from '../store/flatStore';
import { useTasks } from '../hooks/useTasks';
import { TaskCard } from '../components/tasks/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';

const STATUS_TABS = ['Pending', 'Completed', 'All'];

const PRIORITIES = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export default function TasksPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const { members } = useFlatStore();
  const flatId = user?.membership?.flatId;

  const [activeTab, setActiveTab] = useState('Pending');

  const filterString = activeTab === 'Pending' ? 'PENDING,IN_PROGRESS'
                     : activeTab === 'Completed' ? 'COMPLETED'
                     : '';

  const { tasks, isLoading, createTask, isCreating } = useTasks(flatId, filterString);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeMembers = members.filter(m => m.isActive);

  // Client-side sorting: overdue first, then by due date
  const sortedTasks = [...tasks].sort((a: any, b: any) => {
    if (activeTab === 'Pending') {
      const aOverdue = a.dueDate && new Date(a.dueDate) < new Date();
      const bOverdue = b.dueDate && new Date(b.dueDate) < new Date();
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
    }
    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setPriority('MEDIUM');
    setDueDate('');
    setErrors({});
  };

  const openSheet = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (title.trim().length < 2) newErrors.title = 'Title must be at least 2 characters';
    if (description.length > 500) newErrors.description = 'Max 500 characters';
    if (dueDate) {
      const selected = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) newErrors.dueDate = 'Due date cannot be in the past';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      assignedTo: assignedTo || undefined,
      priority,
      dueDate: dueDate || undefined,
    }, {
      onSuccess: () => {
        setIsSheetOpen(false);
        resetForm();
      },
    });
  };

  return (
    <div className="pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/flat')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        </div>
        <Button size="sm" onClick={openSheet} className="bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500">
          <Plus className="w-4 h-4 mr-1" />
          New task
        </Button>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
        </div>
      ) : sortedTasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8" />}
          title={`No ${activeTab.toLowerCase()} tasks`}
          description={activeTab === 'Pending' ? "You're all caught up!" : "Nothing to show here"}
        />
      ) : (
        <div className="space-y-3">
          {sortedTasks.map((t: any) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      )}

      {/* Create Task BottomSheet */}
      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="New Task">
        <div className="space-y-5">
          <Input
            label="Task Title"
            placeholder="e.g. Buy cleaning supplies"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <Textarea
            label="Description (optional)"
            placeholder="Add details about this task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            error={errors.description}
          />

          <Select
            label="Assign to"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            options={[
              { label: 'Unassigned', value: '' },
              ...activeMembers.map(m => ({ label: m.user?.name || 'User', value: m.userId })),
            ]}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={PRIORITIES}
          />

          <Input
            label="Due Date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            error={errors.dueDate}
          />

          <Button
            onClick={handleSubmit}
            isLoading={isCreating}
            className="w-full bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500"
          >
            Create Task
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
