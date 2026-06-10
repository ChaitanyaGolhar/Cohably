import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt, ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight, ClipboardList, BellRing, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { BalanceCard } from '../components/BalanceCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { useBalances, useRecentExpenses, useActiveRentCycle } from '../hooks/useDashboard';
import { useRotations } from '../hooks/useRotations';
import { useTasks } from '../hooks/useTasks';
import { useBillReminders } from '../hooks/useBillReminders';
import { useUnreadCount } from '../hooks/useNotifications';
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

  const { rotations } = useRotations(flatId);
  const { tasks } = useTasks(flatId);
  const { bills } = useBillReminders(flatId);
  const { unreadCount } = useUnreadCount(flatId);

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

  // V2 Derived Data
  const activeRotations = rotations.filter((r: any) => r.isActive && r.currentCycle && r.currentCycle.status !== 'COMPLETED' && r.currentCycle.status !== 'SKIPPED');
  const myOverdueRotations = activeRotations.filter((r: any) => r.currentCycle?.assignedTo?.id === user?.id && r.currentCycle?.status === 'OVERDUE');
  const myPendingRotations = activeRotations.filter((r: any) => r.currentCycle?.assignedTo?.id === user?.id && r.currentCycle?.status === 'PENDING');
  const rotationToAlert = myOverdueRotations[0] || myPendingRotations[0];
  const myOverdueRotationCount = myOverdueRotations.length;

  const myOverdueTasks = tasks.filter((t: any) => 
    t.assignedTo?.id === user?.id && 
    (t.status === 'PENDING' || t.status === 'IN_PROGRESS') && 
    t.dueDate && new Date(t.dueDate) < new Date()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const billsDueSoon = bills.filter((b: any) => {
    if (!b.isActive) return false;
    const dueDate = new Date(b.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2;
  }).sort((a: any, b: any) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  const billToAlert = billsDueSoon[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Here's your household summary.</p>
        </div>
        <Link to="/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>
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

      {/* V2 Alert Cards */}
      {rotationToAlert && (
        <Link to={`/flat/rotations/${rotationToAlert.id}`}>
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-violet-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-violet-900">Your turn: {rotationToAlert.name}</h3>
                <p className={`text-sm mt-0.5 ${rotationToAlert.currentCycle?.status === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-violet-600'}`}>
                  {rotationToAlert.currentCycle?.status === 'OVERDUE' 
                    ? `Overdue since ${new Date(rotationToAlert.currentCycle?.dueDate || '').toLocaleDateString()}`
                    : `Due ${new Date(rotationToAlert.currentCycle?.dueDate || '').toLocaleDateString()}`
                  }
                </p>
                {myOverdueRotationCount > 1 && (
                  <p className="text-xs text-violet-600 mt-1">+{myOverdueRotationCount - 1} more duties due</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-violet-400 flex-shrink-0" />
          </div>
        </Link>
      )}

      {myOverdueTasks.length > 0 && (
        <Link to="/flat/tasks">
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <ClipboardList className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <span className="text-sm font-medium text-cyan-800 flex-1">
              You have {myOverdueTasks.length} overdue task{myOverdueTasks.length !== 1 ? 's' : ''}
            </span>
            <ChevronRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          </div>
        </Link>
      )}

      {billToAlert && (
        <Link to="/flat/bills">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <BellRing className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-amber-900 block truncate">
                {Math.ceil((new Date(billToAlert.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) === 0 
                  ? `Due today: ${billToAlert.title}` 
                  : `${billToAlert.title} due in ${Math.ceil((new Date(billToAlert.nextDueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days`
                }
                {billToAlert.amountEstimate ? ` — ${currentFlat?.currency}${billToAlert.amountEstimate}` : ''}
              </span>
              {billsDueSoon.length > 1 && (
                <span className="text-xs text-amber-700 block mt-0.5">+{billsDueSoon.length - 1} more</span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
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
