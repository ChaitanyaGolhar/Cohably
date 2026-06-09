import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { BalanceCard } from '../components/BalanceCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { useBalances, useRecentExpenses, useActiveRentCycle } from '../hooks/useDashboard';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { Button } from '../components/ui/Button';
import { BalanceBreakdownModal } from '../components/BalanceBreakdownModal';
import { SettleSheet } from '../components/SettleSheet';
import { useFlatStore } from '../store/flatStore';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const flatId = user?.membership?.flatId;
  const currentFlat = useFlatStore((s) => s.currentFlat);

  const { data: balances, isLoading: isBalancesLoading } = useBalances(flatId);
  const { data: recentExpenses, isLoading: isExpensesLoading } = useRecentExpenses(flatId);
  const { data: activeRentCycle } = useActiveRentCycle(flatId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<{ id: string; name: string; amount: number; avatarUrl?: string | null; isOwed: boolean } | null>(null);

  const handleRowClick = (userId: string, name: string, amount: number, isOwed: boolean) => {
    setSelectedTarget({ id: userId, name, amount, isOwed, avatarUrl: null });
    setModalOpen(true);
  };

  const handleSettleClick = () => {
    setSheetOpen(true);
  };

  const youOwe = balances?.youOwe || [];
  const owedToYou = balances?.owedToYou || [];
  const totalOwed = youOwe.reduce((sum, b) => sum + b.amount, 0);
  const totalOwedToYou = owedToYou.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Here's your household summary.</p>
      </div>

      {/* Hero Balance Card */}
      <BalanceCard balances={balances} isLoading={isBalancesLoading} />

      {/* Who Owes Who Section */}
      {(youOwe.length > 0 || owedToYou.length > 0) && (
        <div className="space-y-6">
          {youOwe.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-red-500" />
                  You Owe
                </h3>
                <AmountDisplay amount={totalOwed} currency={currentFlat?.currency} className="font-bold text-red-500 text-sm" />
              </div>
              <div className="space-y-3">
                {youOwe.map(b => (
                  <Card 
                    key={b.userId} 
                    className="flex items-center justify-between border-red-100 bg-red-50/30 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                    onClick={() => handleRowClick(b.userId, b.name, b.amount, false)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{b.name}</p>
                      <AmountDisplay amount={b.amount} currency={currentFlat?.currency} type="negative" className="mt-1" />
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTarget({ id: b.userId, name: b.name, amount: b.amount, isOwed: false, avatarUrl: null });
                        handleSettleClick();
                      }}
                    >
                      Pay Now
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {owedToYou.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                  Owed to you
                </h3>
                <AmountDisplay amount={totalOwedToYou} currency={currentFlat?.currency} className="font-bold text-emerald-600 text-sm" />
              </div>
              <div className="space-y-3">
                {owedToYou.map(b => (
                  <Card 
                    key={b.userId} 
                    className="flex items-center justify-between border-emerald-100 bg-emerald-50/30 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                    onClick={() => handleRowClick(b.userId, b.name, b.amount, true)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{b.name}</p>
                      <AmountDisplay amount={b.amount} currency={currentFlat?.currency} type="positive" className="mt-1" />
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="text-emerald-700 bg-white border-emerald-200 hover:bg-emerald-50 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTarget({ id: b.userId, name: b.name, amount: b.amount, isOwed: true, avatarUrl: null });
                        handleSettleClick();
                      }}
                    >
                      Record Receipt
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Rent Cycle Banner */}
      {activeRentCycle && (
        <Link to="/rent">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-amber-900">Rent is active</h4>
                <p className="text-sm text-amber-700">Due on {new Date(activeRentCycle.dueDate).toLocaleDateString()}</p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 font-bold">!</span>
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Link to="/expenses" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>

        {isExpensesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse h-20 bg-gray-100 border-none" />
            ))}
          </div>
        ) : recentExpenses?.length ? (
          <div className="space-y-3">
            {recentExpenses.map(expense => (
              <ExpenseCard key={expense.id} expense={expense} currentUserId={user?.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Receipt className="h-8 w-8" />}
            title="No expenses yet"
            description="Add your first expense to start tracking household spending."
          />
        )}
      </div>

      {/* Modals */}
      <BalanceBreakdownModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        targetUser={selectedTarget}
        netAmount={selectedTarget ? (selectedTarget.isOwed ? selectedTarget.amount : -selectedTarget.amount) : 0}
        onSettleClick={handleSettleClick}
      />

      {selectedTarget && (
        <SettleSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          targetUserId={selectedTarget.id}
          targetUserName={selectedTarget.name}
          amountOwed={selectedTarget.amount}
        />
      )}

      {/* FAB for Add Expense */}
      <Link
        to="/expenses/add"
        className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 h-14 w-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
