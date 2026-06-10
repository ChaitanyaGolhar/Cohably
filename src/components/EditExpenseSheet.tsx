import { useState, useEffect } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { CATEGORIES } from '../lib/constants';
import { useExpenseMutations } from '../hooks/useExpenseMutations';
import type { Expense } from '../types/api';

interface EditExpenseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense;
  flatId: string;
}

export function EditExpenseSheet({ isOpen, onClose, expense, flatId }: EditExpenseSheetProps) {
  const [title, setTitle] = useState(expense.title);
  const [category, setCategory] = useState(expense.category);
  const [note, setNote] = useState(expense.note || '');
  const [error, setError] = useState<string | null>(null);

  const { editExpense, isEditing } = useExpenseMutations(flatId);

  useEffect(() => {
    if (isOpen) {
      setTitle(expense.title);
      setCategory(expense.category);
      setNote(expense.note || '');
      setError(null);
    }
  }, [isOpen, expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await editExpense({
        expenseId: expense.id,
        data: { title: title.trim(), category, note: note.trim() || undefined }
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to edit expense');
    }
  };

  const isEditable = new Date(expense.createdAt).getTime() > Date.now() - 10 * 60 * 1000;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Edit Expense">
      {!isEditable ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-4 text-sm">
          You can only edit an expense within 10 minutes of creating it.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pb-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grocery"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <Input
              value={expense.amount.toString()}
              disabled
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Amount cannot be edited. Delete and recreate to change the amount.</p>
          </div>

          <div>
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={CATEGORIES}
            />
          </div>

          <div>
            <Textarea
              label="Note (Optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add some details..."
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isEditing}>
            Save Changes
          </Button>
        </form>
      )}
    </BottomSheet>
  );
}
