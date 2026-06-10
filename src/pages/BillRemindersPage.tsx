import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFlatStore } from '../store/flatStore';
import { useBillReminders } from '../hooks/useBillReminders';
import { BillReminderCard } from '../components/bills/BillReminderCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { CATEGORIES } from '../lib/constants';

const RECURRENCES = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Biannual', value: 'BIANNUAL' },
  { label: 'Annual', value: 'ANNUAL' },
  { label: 'Custom', value: 'CUSTOM' },
];

const DAYS_OF_MONTH = Array.from({ length: 28 }, (_, i) => ({
  label: `${i + 1}`,
  value: `${i + 1}`,
}));

export default function BillRemindersPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const { members } = useFlatStore();
  const flatId = user?.membership?.flatId;
  const isAdmin = user?.membership?.role === 'ADMIN';

  const { bills, isLoading, createBill, isCreating } = useBillReminders(flatId);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('UTILITIES');
  const [amountEstimate, setAmountEstimate] = useState('');
  const [recurrence, setRecurrence] = useState('MONTHLY');
  const [recurrenceDay, setRecurrenceDay] = useState('');
  const [customNextDate, setCustomNextDate] = useState('');
  const [responsibleMember, setResponsibleMember] = useState('');
  const [remindDaysBefore, setRemindDaysBefore] = useState('3');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeMembers = members.filter(m => m.isActive);

  const activeBills = bills.filter((b: any) => b.isActive);
  const sortedBills = [...activeBills].sort((a: any, b: any) => {
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });

  const resetForm = () => {
    setTitle('');
    setCategory('UTILITIES');
    setAmountEstimate('');
    setRecurrence('MONTHLY');
    setRecurrenceDay('');
    setCustomNextDate('');
    setResponsibleMember('');
    setRemindDaysBefore('3');
    setErrors({});
  };

  const openSheet = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (title.trim().length < 1) newErrors.title = 'Title is required';
    if (amountEstimate && parseFloat(amountEstimate) <= 0) newErrors.amountEstimate = 'Must be greater than 0';
    if (recurrence !== 'CUSTOM' && !recurrenceDay) newErrors.recurrenceDay = 'Select a day of month';
    if (recurrence === 'CUSTOM' && !customNextDate) newErrors.customNextDate = 'Select next due date';
    const remind = parseInt(remindDaysBefore);
    if (isNaN(remind) || remind < 1 || remind > 30) newErrors.remindDaysBefore = 'Must be between 1 and 30';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createBill({
      title: title.trim(),
      category,
      amountEstimate: amountEstimate ? parseFloat(amountEstimate) : undefined,
      recurrence,
      recurrenceDay: recurrenceDay ? parseInt(recurrenceDay) : undefined,
      customNextDate: customNextDate || undefined,
      responsibleMember: responsibleMember || undefined,
      remindDaysBefore: parseInt(remindDaysBefore),
    }, {
      onSuccess: () => {
        setIsSheetOpen(false);
        resetForm();
      },
    });
  };

  const showRecurrenceDay = recurrence !== 'CUSTOM';
  const showCustomDate = recurrence === 'CUSTOM';

  return (
    <div className="pb-20 sm:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/flat')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Bill Reminders</h1>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={openSheet} className="bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500">
            <Plus className="w-4 h-4 mr-1" />
            New bill
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
      ) : sortedBills.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No bill reminders"
          description="Track recurring bills so nothing slips"
        />
      ) : (
        <div className="space-y-3">
          {sortedBills.map((b: any) => (
            <BillReminderCard key={b.id} bill={b} />
          ))}
        </div>
      )}

      {/* Create Bill Reminder BottomSheet */}
      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="New Bill Reminder">
        <div className="space-y-5">
          <Input
            label="Bill Title"
            placeholder="e.g. WiFi Bill, Electricity"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES.map(c => ({ label: c.label, value: c.value }))}
          />

          <Input
            label="Amount Estimate (₹) — optional"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amountEstimate}
            onChange={(e) => setAmountEstimate(e.target.value)}
            error={errors.amountEstimate}
          />

          <Select
            label="Recurrence"
            value={recurrence}
            onChange={(e) => { setRecurrence(e.target.value); setRecurrenceDay(''); setCustomNextDate(''); }}
            options={RECURRENCES}
          />

          {showRecurrenceDay && (
            <Select
              label="Day of Month"
              value={recurrenceDay}
              onChange={(e) => setRecurrenceDay(e.target.value)}
              options={[{ label: 'Select day...', value: '' }, ...DAYS_OF_MONTH]}
              error={errors.recurrenceDay}
            />
          )}

          {showCustomDate && (
            <Input
              label="Next Due Date"
              type="date"
              value={customNextDate}
              onChange={(e) => setCustomNextDate(e.target.value)}
              error={errors.customNextDate}
            />
          )}

          <Select
            label="Responsible Member"
            value={responsibleMember}
            onChange={(e) => setResponsibleMember(e.target.value)}
            options={[
              { label: 'Everyone (flat shared)', value: '' },
              ...activeMembers.map(m => ({ label: m.user?.name || 'User', value: m.userId })),
            ]}
          />

          <Input
            label="Remind X days before"
            type="number"
            min={1}
            max={30}
            value={remindDaysBefore}
            onChange={(e) => setRemindDaysBefore(e.target.value)}
            error={errors.remindDaysBefore}
          />

          <Button
            onClick={handleSubmit}
            isLoading={isCreating}
            className="w-full bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500"
          >
            Create Reminder
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
