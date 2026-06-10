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
import { Select } from '../components/ui/Select';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { BottomSheet } from '../components/ui/BottomSheet';
import { format } from 'date-fns';

export default function RentCyclePage() {
  const user = useAuthStore((s) => s.user);
  const currentFlat = useFlatStore((s) => s.currentFlat);
  const members = useFlatStore((s) => s.members);
  const myMembership = members.find(m => m.userId === user?.id);
  const isAdmin = myMembership?.role === 'ADMIN';

  const { cycles, isLoading, createCycle, isCreating, payRent, isPaying, approvePayment, isApproving, closeCycle, isClosing } = useRentCycles(currentFlat?.id);

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});

  const activeCycles = cycles.filter(c => !c.isClosed);
  const pastCycles = cycles.filter(c => c.isClosed);

  const activeMembers = members.filter(m => m.isActive);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!month || !totalAmount || !dueDate) return;

    let splits = undefined;
    if (splitType === 'CUSTOM') {
      splits = activeMembers.map(m => ({
        userId: m.userId,
        amountOwed: Number(customSplits[m.userId] || 0)
      }));
    }

    try {
      await createCycle({ 
        month, 
        totalAmount: Number(totalAmount), 
        dueDate: new Date(dueDate).toISOString(),
        splitType,
        customSplits: splits
      });
      setIsCreateSheetOpen(false);
    } catch (e) {}
  };

  const handlePayRent = async (cycleId: string) => {
    try {
      await payRent({ cycleId, method: 'BANK' });
    } catch (e) {}
  };

  const handleApprove = async (cycleId: string, userId: string) => {
    try {
      await approvePayment({ cycleId, userId });
    } catch (e) {}
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-40 bg-gray-100 rounded-2xl" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
    </div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rent</h1>
          <p className="text-sm text-gray-500">Manage monthly rent payments</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateSheetOpen(true)} size="sm">
            New Rent Cycle
          </Button>
        )}
      </div>

      {activeCycles.length > 0 ? (
        activeCycles.map((cycle) => {
          const myPayment = cycle.payments?.find(p => p.userId === user?.id);

          return (
            <Card key={cycle.id} className="border-2 border-indigo-100 shadow-md relative overflow-hidden mb-6">
              <div className="absolute top-0 left-0 w-1 bg-indigo-500 h-full" />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Badge variant="info" className="mb-2">Active Cycle</Badge>
                  <h2 className="text-xl font-bold text-gray-900">Rent for {cycle.month}</h2>
                  <p className="text-sm text-gray-500">Due {new Date(cycle.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">Total Rent</p>
                  <AmountDisplay amount={cycle.totalAmount} currency={currentFlat?.currency} size="lg" className="text-indigo-600" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Payment Status</h3>
                {cycle.payments?.map(payment => (
                  <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 gap-3">
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={payment.user?.avatarUrl} name={payment.user?.name} size="sm" />
                        <span className="font-medium text-gray-900">{payment.userId === user?.id ? 'You' : payment.user?.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 block sm:hidden">
                        {currentFlat?.currency} {payment.amountOwed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                        {currentFlat?.currency} {payment.amountOwed}
                      </span>

                      <div className="flex items-center gap-2">
                        {payment.isApproved ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </Badge>
                        ) : payment.hasPaid ? (
                          <>
                            <Badge variant="warning" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Pending Approval
                            </Badge>
                            {isAdmin && (
                              <Button size="sm" onClick={() => handleApprove(cycle.id, payment.userId)} isLoading={isApproving}>
                                Approve
                              </Button>
                            )}
                          </>
                        ) : (
                          <Badge variant="danger">Unpaid</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                {!myPayment?.hasPaid ? (
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                    onClick={() => handlePayRent(cycle.id)}
                    isLoading={isPaying}
                  >
                    Mark My Rent as Paid
                  </Button>
                ) : !myPayment.isApproved ? (
                  <Button variant="secondary" className="flex-1" disabled>
                    Waiting for Admin Approval
                  </Button>
                ) : (
                  <Button variant="secondary" className="flex-1" disabled>
                    Your Payment is Approved
                  </Button>
                )}
                
                {isAdmin && (
                  <Button 
                    variant="danger" 
                    onClick={() => closeCycle(cycle.id)}
                    isLoading={isClosing}
                  >
                    Close Cycle
                  </Button>
                )}
              </div>
            </Card>
          );
        })
      ) : (
        <EmptyState
          icon={<Calendar className="h-8 w-8" />}
          title="No active rent cycles"
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
                  <AmountDisplay amount={cycle.totalAmount} currency={currentFlat?.currency} />
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
            label="Total Amount"
            type="number"
            step="0.01"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            leftIcon={<span className="font-semibold text-gray-500">{currentFlat?.currency}</span>}
            required
          />
          <Select
            label="Split Type"
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
            options={[
              { value: 'EQUAL', label: 'Split Equally' },
              { value: 'CUSTOM', label: 'Custom Split' }
            ]}
          />

          {splitType === 'CUSTOM' && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900">Enter custom splits</h4>
              {activeMembers.map(m => (
                <div key={m.userId} className="flex items-center gap-3">
                  <Avatar src={m.user?.avatarUrl} name={m.user?.name} size="sm" />
                  <span className="flex-1 text-sm font-medium">{m.userId === user?.id ? 'You' : m.user?.name}</span>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      value={customSplits[m.userId] || ''}
                      onChange={(e) => setCustomSplits({ ...customSplits, [m.userId]: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

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
