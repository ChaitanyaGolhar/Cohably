import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { useFlatStore } from '../store/flatStore';
import { useSettlementMutations } from '../hooks/useSettlementMutations';
import { PAYMENT_METHODS } from '../lib/constants';

const settleSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.string().min(1, 'Payment method is required'),
  note: z.string().optional(),
});

type SettleForm = z.infer<typeof settleSchema>;

interface SettleSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  amountOwed: number;
}

export function SettleSheet({ isOpen, onClose, targetUserId, targetUserName, amountOwed }: SettleSheetProps) {
  const currentFlat = useFlatStore((s) => s.currentFlat);
  const { recordSettlement, isRecording } = useSettlementMutations(currentFlat?.id);

  const form = useForm<SettleForm>({
    resolver: zodResolver(settleSchema),
    defaultValues: {
      amount: amountOwed,
      method: 'CASH',
      note: '',
    },
  });

  const onSubmit = async (data: SettleForm) => {
    try {
      await recordSettlement({
        toUser: targetUserId,
        amount: data.amount,
        method: data.method,
        note: data.note,
      });
      onClose();
    } catch (e) {}
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Record Payment">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500">You are paying</p>
        <p className="text-lg font-semibold text-gray-900">{targetUserName}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          leftIcon={<span className="font-semibold text-gray-500">{currentFlat?.currency}</span>}
          {...form.register('amount', { valueAsNumber: true })}
          error={form.formState.errors.amount?.message}
        />

        <Select
          label="Payment Method"
          options={PAYMENT_METHODS}
          {...form.register('method')}
          error={form.formState.errors.method?.message}
        />

        <Textarea
          label="Note (optional)"
          placeholder="e.g. For last month's utilities"
          {...form.register('note')}
        />

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" isLoading={isRecording}>
          Confirm Payment
        </Button>
      </form>
    </BottomSheet>
  );
}
