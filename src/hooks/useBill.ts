import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBill, updateBill, markPaid, deleteBill } from '../api/bills';
import { useToast } from './useToast';

export function useBill(flatId?: string, billId?: string) {
  const queryClient = useQueryClient();
  const addToast = useToast(s => s.addToast);

  const billQuery = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => getBill(flatId!, billId!),
    enabled: !!flatId && !!billId,
    staleTime: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => updateBill(flatId!, billId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      queryClient.invalidateQueries({ queryKey: ['bill-reminders', flatId] });
      addToast({ type: 'success', title: 'Bill updated' });
    }
  });

  const markPaidMutation = useMutation({
    mutationFn: async (data: { createExpense: boolean, expenseNote?: string }) => markPaid(flatId!, billId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      queryClient.invalidateQueries({ queryKey: ['bill-reminders', flatId] });
      addToast({ type: 'success', title: 'Marked as paid' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteBill(flatId!, billId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders', flatId] });
      addToast({ type: 'info', title: 'Bill deleted' });
    }
  });

  return {
    bill: billQuery.data,
    isLoading: billQuery.isLoading,
    updateBill: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    markPaid: markPaidMutation.mutate,
    isMarkingPaid: markPaidMutation.isPending,
    deleteBill: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
