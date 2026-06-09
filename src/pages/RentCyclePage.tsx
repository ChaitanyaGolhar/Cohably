import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFlatStore } from '../store/flatStore';
import { useRentCycles } from '../hooks/useRentCycles';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { BottomSheet } from '../components/ui/BottomSheet';
import { format } from 'date-fns';

export default function RentCyclePage() {
  const user = useAuthStore((s) => s.user);
  const currentFlat = useFlatStore((s) => s.currentFlat);
  const members = useFlatStore((s) => s.members);
  const myMembership = members.find(m => m.userId === user?.id);
  const isAdmin = myMembership?.role === 'ADMIN';

  const { cycles, isLoading, createCycle, isCreating, payRent, isPaying, closeCycle, isClosing } = useRentCycles(currentFlat?.id);

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const activeCycle = cycles.find(c => !c.isClosed);
  const pastCycles = cycles.filter(c => c.isClosed);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!month || !amount || !dueDate) return;
    try {
      await createCycle({ month, amountPerPerson: Number(amount), dueDate: new Date(dueDate).toISOString() });
      setIsCreateSheetOpen(false);
    } catch (e) {}
  };

  const handlePayRent = async (cycleId: string) => {
    try {
      await payRent({ cycleId, method: 'BANK' });
    } catch (e) {}
  };

  const myPayment = activeCycle?.payments?.find(p => p.userId === user?.id);

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-40 bg-gray-100 rounded-2xl" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rent</h1>
          <p className="text-sm text-gray-500">Manage monthly rent payments</p>
        </div>
        {isAdmin && !activeCycle && (
          <Button onClick={() => setIsCreateSheetOpen(true)} size="sm">
            New Rent Cycle
          </Button>
        )}
      </div>

      {activeCycle ? (
        <Card className="border-2 border-indigo-100 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 bg-indigo-500 h-full" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge variant="info" className="mb-2">Active Cycle</Badge>
              <h2 className="text-xl font-bold text-gray-900">Rent for {activeCycle.month}</h2>
              <p className="text-sm text-gray-500">Due {new Date(activeCycle.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Per Person</p>
              <AmountDisplay amount={activeCycle.amountPerPerson} currency={currentFlat?.currency} size="lg" className="text-indigo-600" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Payment Status</h3>
            {activeCycle.payments?.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar src={payment.user?.avatarUrl} name={payment.user?.name} size="sm" />
                  <span className="font-medium text-gray-900">{payment.userId === user?.id ? 'You' : payment.user?.name}</span>
                </div>
                {payment.hasPaid ? (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Paid
                  </Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
            {!myPayment?.hasPaid ? (
              <Button 
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                onClick={() => handlePayRent(activeCycle.id)}
                isLoading={isPaying}
              >
                Mark My Rent as Paid
              </Button>
            ) : (
              <Button variant="secondary" className="flex-1" disabled>
                You have paid
              </Button>
            )}
            
            {isAdmin && (
              <Button 
                variant="danger" 
                onClick={() => closeCycle(activeCycle.id)}
                isLoading={isClosing}
              >
                Close Cycle
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<Calendar className="h-8 w-8" />}
          title="No active rent cycle"
          description={isAdmin ? "Create a new rent cycle to start tracking payments." : "Your flat admin hasn't started a rent cycle yet."}
          action={isAdmin && (
            <Button onClick={() => setIsCreateSheetOpen(true)}>
              Start Rent Cycle
            </Button>
          )}
        />
      )}

      {pastCycles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Past Cycles</h3>
          {pastCycles.map(cycle => (
            <Card key={cycle.id} className="opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{cycle.month}</h4>
                  <p className="text-sm text-gray-500">
                    {cycle.payments?.filter(p => p.hasPaid).length}/{cycle.payments?.length} paid
                  </p>
                </div>
                <div className="text-right">
                  <AmountDisplay amount={cycle.amountPerPerson} currency={currentFlat?.currency} />
                  <Badge className="mt-1">Closed</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BottomSheet isOpen={isCreateSheetOpen} onClose={() => setIsCreateSheetOpen(false)} title="New Rent Cycle">
        <form onSubmit={handleCreate} className="space-y-5">
          <Input
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
          <Input
            label="Amount Per Person"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<span className="font-semibold text-gray-500">{currentFlat?.currency}</span>}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" isLoading={isCreating}>
            Start Cycle
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
