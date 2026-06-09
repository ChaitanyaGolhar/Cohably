import { useState } from 'react';
import { useFlatStore } from '../store/flatStore';
import { useAuthStore } from '../store/authStore';
import { useExpensesList } from '../hooks/useExpensesList';
import { ExpenseCard } from '../components/ExpenseCard';
import { Select } from '../components/ui/Select';
import { CATEGORIES } from '../lib/constants';
import { Receipt, Filter } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

export default function ExpenseHistoryPage() {
  const currentFlat = useFlatStore((s) => s.currentFlat);
  const members = useFlatStore((s) => s.members);
  const user = useAuthStore((s) => s.user);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [payerFilter, setPayerFilter] = useState('ALL');

  const { data, isLoading } = useExpensesList(currentFlat?.id, categoryFilter, payerFilter);

  const categoryOptions = [
    { label: 'All Categories', value: 'ALL' },
    ...CATEGORIES.map(c => ({ label: c.label, value: c.value }))
  ];

  const payerOptions = [
    { label: 'Everyone', value: 'ALL' },
    ...members.map(m => ({ label: m.user?.name || '', value: m.userId }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500">All household spending</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Select
            options={payerOptions}
            value={payerFilter}
            onChange={(e) => setPayerFilter(e.target.value)}
          />
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse h-24 bg-white rounded-2xl border border-gray-100" />
            ))}
          </div>
        ) : data?.expenses.length ? (
          <div className="space-y-3">
            {data.expenses.map(expense => (
              <ExpenseCard key={expense.id} expense={expense} currentUserId={user?.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Receipt className="h-8 w-8" />}
            title="No expenses found"
            description="Try adjusting your filters or add a new expense."
          />
        )}
      </div>
    </div>
  );
}
