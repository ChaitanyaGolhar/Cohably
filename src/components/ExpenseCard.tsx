import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { CategoryBadge } from './ui/CategoryBadge';
import { AmountDisplay } from './ui/AmountDisplay';
import { formatTimeAgo } from '../lib/utils';
import type { Expense } from '../types/api';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExpenseCardProps {
  expense: Expense;
  currentUserId?: string;
}

export function ExpenseCard({ expense, currentUserId }: ExpenseCardProps) {
  const isPayer = expense.paidBy === currentUserId;
  const mySplit = expense.splits?.find(s => s.userId === currentUserId);
  const myShare = mySplit ? mySplit.amountOwed : 0;

  return (
    <Link to={`/expenses/${expense.id}`} className="block transition-transform active:scale-[0.98]">
      <Card padding="md" className={`hover:shadow-md transition-shadow cursor-pointer ${expense.isDisputed ? 'border-l-4 border-l-red-500' : ''}`}>
        <div className="flex items-center gap-4">
          <Avatar 
            src={expense.payer?.avatarUrl} 
            name={expense.payer?.name} 
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {expense.title}
              </h4>
              {expense.isDisputed && (
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span className="truncate">{expense.payer?.name?.split(' ')[0]} paid</span>
              <span>•</span>
              <span>{formatTimeAgo(expense.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <AmountDisplay amount={expense.amount} size="md" className="font-bold text-gray-900" />
            <CategoryBadge category={expense.category} />
          </div>
        </div>

        {myShare > 0 && !isPayer && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
            <span className="text-gray-500">Your share</span>
            <AmountDisplay amount={myShare} size="sm" type="negative" />
          </div>
        )}
      </Card>
    </Link>
  );
}
