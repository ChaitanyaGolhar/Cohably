import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFlatStore } from '../store/flatStore';
import { useRotations } from '../hooks/useRotations';
import { RotationCard } from '../components/rotations/RotationCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { MemberChip } from '../components/ui/MemberChip';

const FREQUENCIES = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Biweekly', value: 'BIWEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'On Demand', value: 'ON_DEMAND' },
];

const DAYS_OF_WEEK = [
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
  { label: 'Sunday', value: '0' },
];

const DAYS_OF_MONTH = Array.from({ length: 28 }, (_, i) => ({
  label: `${i + 1}`,
  value: `${i + 1}`,
}));

export default function RotationsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const { members } = useFlatStore();
  const flatId = user?.membership?.flatId;
  const isAdmin = user?.membership?.role === 'ADMIN';

  const { rotations, isLoading, createRotation, isCreating } = useRotations(flatId);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('WEEKLY');
  const [frequencyDay, setFrequencyDay] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeMembers = members.filter(m => m.isActive);

  const activeRotations = rotations.filter((r: any) => r.isActive);
  const sortedRotations = [...activeRotations].sort((a: any, b: any) => {
    const aDate = a.currentCycle?.dueDate ? new Date(a.currentCycle.dueDate).getTime() : Infinity;
    const bDate = b.currentCycle?.dueDate ? new Date(b.currentCycle.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setFrequency('WEEKLY');
    setFrequencyDay('');
    setSelectedMemberIds([]);
    setErrors({});
  };

  const openSheet = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const toggleMember = (userId: string) => {
    setSelectedMemberIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (description.length > 200) newErrors.description = 'Max 200 characters';
    if (frequency === 'WEEKLY' && !frequencyDay) newErrors.frequencyDay = 'Select a day';
    if (frequency === 'MONTHLY' && !frequencyDay) newErrors.frequencyDay = 'Select a day of month';
    if (selectedMemberIds.length < 2) newErrors.members = 'Select at least 2 members';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createRotation({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      frequencyDay: frequencyDay ? parseInt(frequencyDay) : undefined,
      memberIds: selectedMemberIds,
    }, {
      onSuccess: () => {
        setIsSheetOpen(false);
        resetForm();
      },
    });
  };

  const showFrequencyDay = frequency === 'WEEKLY' || frequency === 'MONTHLY';

  return (
    <div className="pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/flat')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Rotations</h1>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={openSheet} className="bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-500">
            <Plus className="w-4 h-4 mr-1" />
            New rotation
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        </div>
      ) : sortedRotations.length === 0 ? (
        <EmptyState
          icon={<RefreshCw className="w-8 h-8" />}
          title="No rotations yet"
          description="Create one to start fair duty assignment"
        />
      ) : (
        <div className="space-y-3">
          {sortedRotations.map((r: any) => (
            <RotationCard key={r.id} rotation={r} />
          ))}
        </div>
      )}

      {/* Create Rotation BottomSheet */}
      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="New Rotation">
        <div className="space-y-5">
          <Input
            label="Rotation Name"
            placeholder="e.g. Room Cleaning"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <Textarea
            label="Description (optional)"
            placeholder="What does this rotation cover?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            error={errors.description}
          />

          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => { setFrequency(e.target.value); setFrequencyDay(''); }}
            options={FREQUENCIES}
          />

          {showFrequencyDay && (
            <Select
              label={frequency === 'WEEKLY' ? 'Day of Week' : 'Day of Month'}
              value={frequencyDay}
              onChange={(e) => setFrequencyDay(e.target.value)}
              options={[
                { label: `Select ${frequency === 'WEEKLY' ? 'day' : 'date'}...`, value: '' },
                ...(frequency === 'WEEKLY' ? DAYS_OF_WEEK : DAYS_OF_MONTH),
              ]}
              error={errors.frequencyDay}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Members
              {errors.members && <span className="text-red-500 ml-2 text-xs font-normal">{errors.members}</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {activeMembers.map(m => (
                <MemberChip
                  key={m.userId}
                  name={m.user?.name || 'User'}
                  avatarUrl={m.user?.avatarUrl}
                  selected={selectedMemberIds.includes(m.userId)}
                  onClick={() => toggleMember(m.userId)}
                  className={selectedMemberIds.includes(m.userId) ? 'border-violet-600 bg-violet-50 hover:bg-violet-50 text-violet-900' : ''}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{selectedMemberIds.length} selected · min 2 required</p>
          </div>

          <Button
            onClick={handleSubmit}
            isLoading={isCreating}
            className="w-full bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-500"
          >
            Create Rotation
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
