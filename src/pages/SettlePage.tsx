import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, WalletCards } from 'lucide-react';
import { useBalances } from '../hooks/useDashboard';
import { useFlatStore } from '../store/flatStore';
import { Card } from '../components/ui/Card';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { Button } from '../components/ui/Button';
import { SettleSheet } from '../components/SettleSheet';
import { BalanceBreakdownModal } from '../components/BalanceBreakdownModal';
import { EmptyState } from '../components/ui/EmptyState';

export default function SettlePage() {
  const currentFlat = useFlatStore((s) => s.currentFlat);
  const { data: balances, isLoading } = useBalances(currentFlat?.id);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<{ id: string; name: string; amount: number; avatarUrl?: string | null; isOwed: boolean } | null>(null);

  const handleRowClick = (userId: string, name: string, amount: number, isOwed: boolean) => {
    // In a real app, we might get avatarUrl from members list. 
    // For now we pass null, Avatar component will use initials.
    setSelectedTarget({ id: userId, name, amount, isOwed, avatarUrl: null });
    setModalOpen(true);
  };

  const handleSettleClick = () => {
    setSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Settle Up</h1>
        <div className="animate-pulse space-y-3">
          <Card className="h-24 bg-gray-100 border-none" />
          <Card className="h-24 bg-gray-100 border-none" />
        </div>
      </div>
    );
  }

  const youOwe = balances?.youOwe || [];
  const owedToYou = balances?.owedToYou || [];
  const totalOwed = youOwe.reduce((sum, b) => sum + b.amount, 0);
  const totalOwedToYou = owedToYou.reduce((sum, b) => sum + b.amount, 0);

  const hasBalances = youOwe.length > 0 || owedToYou.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settle Up</h1>
        <p className="text-sm text-gray-500">Record payments to clear your debts.</p>
      </div>

      {!hasBalances ? (
        <EmptyState
          icon={<WalletCards className="h-8 w-8" />}
          title="You're all settled up!"
          description="You don't owe anyone, and nobody owes you."
        />
      ) : (
        <div className="space-y-8">
          {youOwe.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-red-500" />
                  You Owe
                </h3>
                <AmountDisplay amount={totalOwed} currency={currentFlat?.currency} className="font-bold text-red-500" />
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
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-emerald-500" />
                  Owed to you
                </h3>
                <AmountDisplay amount={totalOwedToYou} currency={currentFlat?.currency} className="font-bold text-emerald-600" />
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
    </div>
  );
}
