import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { MemberChip } from '../components/ui/MemberChip';
import { CATEGORIES } from '../lib/constants';
import { useFlatStore } from '../store/flatStore';
import { useExpenseMutations } from '../hooks/useExpenseMutations';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const expenseSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  splitType: z.enum(['EQUAL', 'CUSTOM']),
  note: z.string().optional(),
  splits: z.array(z.object({
    userId: z.string(),
    amountOwed: z.number()
  })).min(1, 'At least one split is required'),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

export default function AddExpensePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const navigate = useNavigate();
  const { currentFlat, members } = useFlatStore();
  const { addExpense, isAdding } = useExpenseMutations(currentFlat?.id);

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      amount: undefined,
      category: 'FOOD',
      splitType: 'EQUAL',
      note: '',
      splits: members.map(m => ({ userId: m.userId, amountOwed: 0 })),
    },
  });

  const { watch, setValue } = form;
  const amount = watch('amount') || 0;
  const splitType = watch('splitType');
  const currentSplits = watch('splits');

  const activeMembers = members.filter(m => m.isActive);

  // Distribute equal splits
  const distributeEqually = (selectedUserIds: string[]) => {
    if (!amount || selectedUserIds.length === 0) return;
    const splitAmount = Math.round((amount / selectedUserIds.length) * 100) / 100;
    
    const newSplits = members.map(m => ({
      userId: m.userId,
      amountOwed: selectedUserIds.includes(m.userId) ? splitAmount : 0,
    }));
    setValue('splits', newSplits);
  };

  const handleNextStep1 = async () => {
    const isValid = await form.trigger(['title', 'amount', 'category']);
    if (isValid && amount > 0) {
      // Initialize equal splits with everyone
      if (splitType === 'EQUAL') {
        distributeEqually(activeMembers.map(m => m.userId));
      }
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    // Validate splits add up to total
    const totalSplits = currentSplits.reduce((sum, s) => sum + (Number(s.amountOwed) || 0), 0);
    if (Math.abs(totalSplits - amount) > 0.1) {
      form.setError('splits', { message: `Splits must equal total amount (${formatCurrency(amount)}). Current total: ${formatCurrency(totalSplits)}` });
      return;
    }
    form.clearErrors('splits');
    setStep(3);
  };

  const onSubmit = async (data: ExpenseForm) => {
    try {
      const payload = {
        title: data.title,
        amount: data.amount,
        category: data.category,
        splitType: data.splitType,
        note: data.note,
        participants: data.splits.filter(s => s.amountOwed > 0).map(s => s.userId),
        customSplits: data.splitType === 'CUSTOM' ? data.splits.filter(s => s.amountOwed > 0) : undefined,
      };
      await addExpense(payload);
      navigate('/dashboard', { replace: true });
    } catch (e) {}
  };

  if (!currentFlat) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => step > 1 ? setStep((s) => (s - 1) as any) : navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add Expense</h1>
        <div className="w-10" />
      </div>

      <div className="flex items-center gap-2 px-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        ))}
      </div>

      <Card padding="lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h3>
                <Input
                  label="What was this for?"
                  placeholder="e.g., Weekly Groceries"
                  {...form.register('title')}
                  error={form.formState.errors.title?.message}
                />
              </div>

              <div>
                <Input
                  label="Total Amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  leftIcon={<span className="font-semibold">{currentFlat.currency}</span>}
                  {...form.register('amount', { valueAsNumber: true })}
                  error={form.formState.errors.amount?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setValue('category', cat.value)}
                      className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                        watch('category') === cat.value 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="button" onClick={handleNextStep1} className="w-full">
                Continue to Split
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {formatCurrency(amount, currentFlat.currency)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">How do you want to split it?</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setValue('splitType', 'EQUAL');
                      distributeEqually(activeMembers.map(m => m.userId));
                    }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      splitType === 'EQUAL' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Equally
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('splitType', 'CUSTOM')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      splitType === 'CUSTOM' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Custom Split
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {activeMembers.map((member) => {
                  const splitIndex = currentSplits.findIndex(s => s.userId === member.userId);
                  const isIncluded = splitType === 'EQUAL' && currentSplits[splitIndex]?.amountOwed > 0;
                  
                  return (
                    <div key={member.userId} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <MemberChip name={member.user?.name || ''} avatarUrl={member.user?.avatarUrl} />
                      </div>
                      
                      {splitType === 'EQUAL' ? (
                        <button
                          type="button"
                          onClick={() => {
                            const currentlyIncluded = currentSplits.filter(s => s.amountOwed > 0).map(s => s.userId);
                            let nextIncluded = [...currentlyIncluded];
                            if (isIncluded) {
                              nextIncluded = nextIncluded.filter(id => id !== member.userId);
                            } else {
                              nextIncluded.push(member.userId);
                            }
                            distributeEqually(nextIncluded);
                          }}
                          className={`h-6 w-6 rounded-full border flex items-center justify-center transition-colors ${
                            isIncluded ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                          }`}
                        >
                          {isIncluded && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </button>
                      ) : (
                        <div className="w-32 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{currentFlat.currency}</span>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full pl-8 pr-3 py-1.5 text-right rounded-lg border border-gray-200 text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
                            {...form.register(`splits.${splitIndex}.amountOwed`, { valueAsNumber: true })}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {form.formState.errors.splits?.message && (
                <p className="text-sm text-red-500 text-center font-medium">
                  {form.formState.errors.splits.message}
                </p>
              )}

              <Button type="button" onClick={handleNextStep2} className="w-full">
                Review Details
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CategoryBadge category={watch('category')} className="mb-2" />
                    <h3 className="text-xl font-bold text-gray-900">{watch('title')}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <AmountDisplay amount={amount} currency={currentFlat.currency} size="lg" className="text-indigo-600" />
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-indigo-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Split Breakdown</p>
                  {currentSplits.filter(s => s.amountOwed > 0).map(split => {
                    const member = activeMembers.find(m => m.userId === split.userId);
                    return (
                      <div key={split.userId} className="flex justify-between text-sm">
                        <span className="text-gray-700">{member?.user?.name || 'User'}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(split.amountOwed, currentFlat.currency)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Textarea
                  label="Add a note (optional)"
                  placeholder="e.g. For movie night snacks"
                  {...form.register('note')}
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isAdding}>
                Confirm & Add Expense
              </Button>
            </div>
          )}
          
        </form>
      </Card>
    </div>
  );
}
