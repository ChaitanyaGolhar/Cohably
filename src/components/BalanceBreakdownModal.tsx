import { Modal } from './ui/Modal';
import { Avatar } from './ui/Avatar';
import { AmountDisplay } from './ui/AmountDisplay';
import { Button } from './ui/Button';
import { useBalanceBreakdown } from '../hooks/useBalanceBreakdown';
import { useFlatStore } from '../store/flatStore';
import { formatTimeAgo, formatCurrency } from '../lib/utils';
import { useAuthStore } from '../store/authStore';

interface BalanceBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: { id: string; name: string; avatarUrl?: string | null } | null;
  netAmount: number; // Positive if owed to you, negative if you owe
  onSettleClick: () => void;
}

export function BalanceBreakdownModal({ isOpen, onClose, targetUser, netAmount, onSettleClick }: BalanceBreakdownModalProps) {
  const currentFlat = useFlatStore((s) => s.currentFlat);
  const currentUser = useAuthStore((s) => s.user);
  
  const { expenses, isExpensesLoading, settlements, isSettlementsLoading } = useBalanceBreakdown(
    currentFlat?.id,
    targetUser?.id
  );

  if (!targetUser) return null;

  const isOwed = netAmount > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Balance Breakdown">
      <div className="flex flex-col items-center mb-6">
        <Avatar src={targetUser.avatarUrl} name={targetUser.name} size="xl" className="mb-4" />
        <p className="text-sm text-gray-500 font-medium mb-1">
          {isOwed ? `${targetUser.name.split(' ')[0]} owes you` : `You owe ${targetUser.name.split(' ')[0]}`}
        </p>
        <AmountDisplay 
          amount={Math.abs(netAmount)} 
          currency={currentFlat?.currency} 
          size="xl" 
          type={isOwed ? 'positive' : 'negative'}
        />
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {/* Expenses Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Unsettled Expenses</h4>
          {isExpensesLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-12 bg-gray-100 rounded-lg" />
              <div className="h-12 bg-gray-100 rounded-lg" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-gray-500">No unsettled expenses.</p>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp) => {
                const mySplit = exp.splits?.find(s => s.userId === currentUser?.id);
                const theirSplit = exp.splits?.find(s => s.userId === targetUser.id);
                
                // If I paid, they owe me their split
                // If they paid, I owe them my split
                let relevantAmount = 0;
                let sign: 'positive' | 'negative' = 'positive';
                
                if (exp.paidBy === currentUser?.id) {
                  relevantAmount = theirSplit?.amountOwed || 0;
                  sign = 'positive';
                } else if (exp.paidBy === targetUser.id) {
                  relevantAmount = mySplit?.amountOwed || 0;
                  sign = 'negative';
                }

                return (
                  <div key={exp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-sm font-medium text-gray-900 truncate">{exp.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(exp.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <AmountDisplay amount={relevantAmount} currency={currentFlat?.currency} type={sign} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Settlements */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Payments</h4>
          {isSettlementsLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-12 bg-gray-100 rounded-lg" />
            </div>
          ) : settlements.length === 0 ? (
            <p className="text-sm text-gray-500">No previous payments.</p>
          ) : (
            <div className="space-y-2">
              {settlements.map((settle) => {
                const isPaidByMe = settle.fromUser === currentUser?.id;
                return (
                  <div key={settle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-80">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {isPaidByMe ? 'You paid' : `${targetUser.name.split(' ')[0]} paid`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(settle.settledAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(settle.amount, currentFlat?.currency)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Button 
          className="w-full"
          onClick={() => {
            onClose();
            onSettleClick();
          }}
        >
          {isOwed ? 'Record Receipt' : 'Settle Up'}
        </Button>
      </div>
    </Modal>
  );
}
