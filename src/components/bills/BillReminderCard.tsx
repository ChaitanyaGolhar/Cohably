import type { BillReminder } from '../../types/api';
import { DaysUntilBadge } from './DaysUntilBadge';
import { AssigneeChip } from '../ui/AssigneeChip';
import { CategoryBadge } from '../ui/CategoryBadge';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface BillReminderCardProps {
  bill: BillReminder;
}

export function BillReminderCard({ bill }: BillReminderCardProps) {
  const navigate = useNavigate();
  const currentUserId = useAuthStore(s => s.user?.id);
  
  const isCurrentUser = bill.responsibleMember?.id === currentUserId;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(bill.nextDueDate);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;

  return (
    <div 
      onClick={() => navigate(`/flat/bills/${bill.id}`)}
      className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between ${
        isOverdue ? 'bg-red-50 border-l-4 border-l-red-500' : 
        isDueToday ? 'bg-amber-50 border-l-4 border-l-amber-500' : 
        'border-gray-100 border-l-4 border-l-amber-300'
      }`}
    >
      <div className="flex-shrink-0 flex items-center justify-center p-2 rounded-full bg-amber-100/50">
        <CategoryBadge category={bill.category} />
      </div>

      <div className="flex-1 min-w-0 px-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {bill.title}
        </h3>
        
        <div className="flex items-center gap-2">
          {bill.responsibleMember ? (
            <AssigneeChip user={bill.responsibleMember as any} isCurrentUser={isCurrentUser} />
          ) : (
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Flat shared</span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0">
        <DaysUntilBadge nextDueDate={bill.nextDueDate} />
        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          {bill.recurrence.toLowerCase()}
        </span>
      </div>
    </div>
  );
}
