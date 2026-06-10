import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useBill } from '../hooks/useBill';
import { Button } from '../components/ui/Button';
import { AssigneeChip } from '../components/ui/AssigneeChip';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { DaysUntilBadge } from '../components/bills/DaysUntilBadge';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Input } from '../components/ui/Input';

export default function BillDetailPage() {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s: any) => s.user);
  const flatId = user?.membership?.flatId;
  const isAdmin = user?.membership?.role === 'ADMIN';

  const { bill, isLoading, markPaid, isMarkingPaid } = useBill(flatId, billId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [createExpense, setCreateExpense] = useState(true);
  const [expenseNote, setExpenseNote] = useState('');

  if (isLoading || !bill) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isResponsible = bill.responsibleMember?.id === user?.id;

  const handleMarkPaid = () => {
    markPaid(
      { createExpense, expenseNote: createExpense ? expenseNote || bill.title : undefined },
      {
        onSuccess: () => {
          setSheetOpen(false);
        }
      }
    );
  };

  return (
    <div className="pb-20 sm:pb-0 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/flat/bills')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-500">Bill Details</span>
        </div>
        {isAdmin && (
          <DropdownMenu
            trigger={
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            }
            items={[
              { label: 'Edit Bill', onClick: () => {} },
              { label: 'Delete Bill', onClick: () => {}, variant: 'danger' }
            ]}
          />
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={bill.category} />
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
            {bill.recurrence}
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{bill.title}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">Responsible</span>
          {bill.responsibleMember ? (
            <AssigneeChip user={bill.responsibleMember as any} isCurrentUser={isResponsible} />
          ) : (
            <span className="text-sm font-medium text-gray-900">Anyone</span>
          )}
        </div>
        
        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <span className="text-sm text-gray-500 font-medium">Next Due</span>
          <div className="flex items-center gap-2">
            <DaysUntilBadge nextDueDate={bill.nextDueDate} />
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(bill.nextDueDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {bill.amountEstimate && (
          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
            <span className="text-sm text-gray-500 font-medium">Estimated Amount</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
              <DollarSign className="w-4 h-4 text-gray-400" />
              {bill.amountEstimate}
            </div>
          </div>
        )}

        {bill.paymentUrl && (
          <div className="flex items-center justify-between border-t border-gray-50 pt-4">
            <span className="text-sm text-gray-500 font-medium">Payment Link</span>
            <a 
              href={bill.paymentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Pay online <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {bill.isActive && (isAdmin || isResponsible) && (
        <Button 
          className="w-full bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500" 
          onClick={() => setSheetOpen(true)}
        >
          Mark as paid for this cycle
        </Button>
      )}

      {/* Mark Paid BottomSheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="Mark Bill as Paid">
        <div className="p-4 space-y-6">
          <p className="text-sm text-gray-600">
            This will advance the bill to the next cycle and optionally create a shared expense for everyone.
          </p>

          <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <span className="block text-sm font-semibold text-gray-900">Create linked expense?</span>
              <span className="block text-xs text-gray-500 mt-1">Automatically splits the bill equally</span>
            </div>
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${createExpense ? 'bg-indigo-600' : 'bg-gray-200'}`}>
              <input type="checkbox" className="sr-only" checked={createExpense} onChange={(e) => setCreateExpense(e.target.checked)} />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${createExpense ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
          </label>

          {createExpense && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <Input
                label="Expense Note"
                placeholder={bill.title}
                value={expenseNote}
                onChange={(e) => setExpenseNote(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                This will create a new equal-split expense for {bill.amountEstimate ? `₹${bill.amountEstimate}` : 'this bill'}.
              </p>
            </div>
          )}

          <Button 
            className="w-full bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500" 
            onClick={handleMarkPaid} 
            isLoading={isMarkingPaid}
          >
            Confirm & Mark Paid
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
